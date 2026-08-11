import api from '@/lib/axios';

export interface GarrisonDirectorDashboardData {
  garrison: {
    id: string | number;
    name: string;
    code: string;
    location: string;
  };
  summary: {
    totalSchools: number;
    totalStudents: number;
    totalFeeCollected: number;
    totalPendingAmount?: number;
  };
  schools: Array<{
    school_id: string | number;
    school_name: string;
    address: string;
    phone_number: string | null;
    email: string | null;
    total_students: number;
    total_staff: number;
    fee_collected: number;
    pending_amount?: number;
  }>;
}

export const getGarrisonDirectorDashboard = async (): Promise<GarrisonDirectorDashboardData> => {
  const res = await api.get('/garrison-director/dashboard');
  return res.data;
};

export const getGarrisonSchools = async () => {
  const res = await api.get('/garrison-director/schools');
  return res.data;
};

export const createSchoolForGarrison = async (data: {
  name: string;
  address: string;
  phone_number?: string;
  email?: string;
}): Promise<{ id: string | number; message: string }> => {
  const res = await api.post('/garrison-director/schools', data);
  return res.data;
};

export const createSchoolAdmin = async (data: {
  full_name: string;
  username: string;
  email?: string;
  password: string;
  school_id: string | number;
}): Promise<{ id: string | number; message: string }> => {
  const res = await api.post('/garrison-director/school-admins', data);
  return res.data;
};
