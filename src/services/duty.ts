import api from "@/lib/axios";

export interface DutyRecord {
    id: string;
    staff_name: string;
    user_id: string;
    start_date: string;
    end_date: string;
    duty_type: string;
    remarks: string;
}

const dutyService = {
    getRoster: async (params?: any): Promise<DutyRecord[]> => {
        const res = await api.get('/duty-roster', { params });
        return res.data;
    },

    create: async (data: Partial<DutyRecord>): Promise<DutyRecord> => {
        const res = await api.post('/duty-roster', data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/duty-roster/${id}`);
    },

    broadcastWeekly: async (): Promise<any> => {
        const res = await api.post('/duty-roster/broadcast');
        return res.data;
    }
};

export default dutyService;
