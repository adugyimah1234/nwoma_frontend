/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

const API_BASE_URL = "/registrations";

export interface RegistrationData {
  id?: string;
  school_id?: string;
  student_id?: string;
  class_id?: string;
  academic_year_id?: string;
  first_name: string;
  middle_name?: string;
  previous_school: string;
  academic_year: string;
  last_name: string;
  category: string;
  date_of_birth: string | null;
  dob?: string | null; // Added to match student table schema for migration
  class_applying_for: string;
  gender: "Male" | "Female" | "Other";
  email?: string;
  phone_number: string;
  address: string;
  guardian_name: string;
  scores: number;
  payment_type?: "cash" | "momo" | "credit card";
  payment_status?: "unpaid" | "partial" | "paid";
  status: "pending" | "approved" | "rejected" | "admitted";
  relationship: string;
  guardian_phone_number: string;
  registration_date?: string;
}

export interface RegistrationStats {
  totalRegistered: number;
  totalPending: number;
  totalAccepted: number;
  totalRejected: number;
  metrics: {
    date: string;
    count: number;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

export type RegistrationCreateInput = Omit<
  RegistrationData,
  "registration_date" | "id"
>;

export type RegistrationUpdateInput = Partial<RegistrationCreateInput>;

const registrationService = {
  async getAll(): Promise<RegistrationData[]> {
    try {
      const response = await api.get<RegistrationData[]>(API_BASE_URL);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registrations");
    }
  },
  

  async getById(id: string): Promise<RegistrationData> {
    try {
      const response = await api.get<RegistrationData>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registration");
    }
  },

  async create(data: RegistrationCreateInput): Promise<string> {
    try {
      const response = await api.post<{ id: string }>(`${API_BASE_URL}/create`, data);
      return response.data.id;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create registration");
    }
  },

  async update(id: string, data: RegistrationUpdateInput): Promise<RegistrationData> {
    try {
      const response = await api.put<RegistrationData>(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update registration");
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await api.delete(`${API_BASE_URL}/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to delete registration");
    }
  },

  async updatePartial(id: string, data: RegistrationUpdateInput): Promise<RegistrationData> {
  try {
    const response = await api.patch<RegistrationData>(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to update registration");
  }
},
  async getStats(startDate?: string, endDate?: string): Promise<RegistrationStats> {
    try {
      const registrations = await this.getAll();
      
      // Filter by date range if provided
      const filteredRegistrations = startDate && endDate 
        ? registrations.filter(reg => {
            const dateStr = reg.registration_date || (reg as any).created_at || (reg as any).createdAt;
            if (!dateStr) return true; // If no date info, include it in the "all" range
            const date = new Date(dateStr);
            return date >= new Date(startDate) && date <= new Date(endDate);
          })
        : registrations;

      // Calculate totals
      const stats: RegistrationStats = {
        totalRegistered: filteredRegistrations.length,
        totalPending: filteredRegistrations.filter(r => (r.status || '').toLowerCase() === 'pending').length,
        totalAccepted: filteredRegistrations.filter(r => {
          const s = (r.status || '').toLowerCase();
          return s === 'approved' || s === 'admitted';
        }).length,
        totalRejected: filteredRegistrations.filter(r => (r.status || '').toLowerCase() === 'rejected').length,
        metrics: []
      };

      // Group by date and status for metrics
      const groupedByDate = filteredRegistrations.reduce((acc, reg) => {
        const dateStr = reg.registration_date || (reg as any).created_at || (reg as any).createdAt;
        let date = 'Unknown';
        if (dateStr) {
          const d = new Date(dateStr);
          date = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : 'Unknown';
        }
        if (!acc[date]) {
          acc[date] = {
            pending: 0,
            approved: 0,
            rejected: 0
          };
        }

        const rawStatus = (reg.status as string || '').toLowerCase();

        if (rawStatus === 'approved' || rawStatus === 'admitted') {
          acc[date]['approved']++;
        } else if (rawStatus === 'pending') {
          acc[date]['pending']++;
        } else if (rawStatus === 'rejected') {
          acc[date]['rejected']++;
        }
        return acc;
      }, {} as Record<string, Record<'pending' | 'approved' | 'rejected', number>>);

      // Convert to metrics array
      stats.metrics = Object.entries(groupedByDate).flatMap(([date, statuses]) => 
        Object.entries(statuses).map(([status, count]) => ({
          date,
          count,
          status: status as 'pending' | 'approved' | 'rejected'
        }))
      );

      return stats;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch registration statistics");
    }
  }

  
};


export default registrationService;
