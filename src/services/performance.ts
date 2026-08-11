import api from "@/lib/axios";

export interface AttendanceRecord {
    id: string;
    full_name: string;
    role_name: string;
    check_in: string;
    check_out: string | null;
    status: 'present' | 'late' | 'absent' | 'on_leave';
    notes: string;
}

const performanceService = {
    checkIn: async (notes?: string): Promise<any> => {
        const res = await api.post('/performance/check-in', { notes });
        return res.data;
    },

    checkOut: async (): Promise<void> => {
        await api.post('/performance/check-out');
    },

    getRegistry: async (params?: any): Promise<AttendanceRecord[]> => {
        const res = await api.get('/performance/registry', { params });
        return res.data;
    },

    getStaffStats: async (userId: string): Promise<any> => {
        const res = await api.get(`/performance/stats/${userId}`);
        return res.data;
    }
};

export default performanceService;
