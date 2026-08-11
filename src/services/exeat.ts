import api from "@/lib/axios";

export interface ExeatRecord {
    id: string;
    student_name: string;
    class_name: string;
    exeat_type: 'day' | 'weekend' | 'medical' | 'emergency';
    departure_date: string;
    expected_return_date: string;
    actual_return_date: string | null;
    reason: string;
    status: 'pending' | 'approved' | 'departed' | 'returned' | 'overdue';
    approved_by_name: string;
}

const exeatService = {
    getAll: async (params?: any): Promise<ExeatRecord[]> => {
        const res = await api.get('/exeats', { params });
        return res.data;
    },

    create: async (data: any): Promise<ExeatRecord> => {
        const res = await api.post('/exeats', data);
        return res.data;
    },

    updateStatus: async (id: string, status: string): Promise<void> => {
        await api.patch(`/exeats/${id}/status`, { status });
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/exeats/${id}`);
    }
};

export default exeatService;
