import api from "@/lib/axios";

export interface ParentRecord {
    phone_number: string;
    full_name: string;
    address: string;
    ward_count: number;
}

export interface ParentDashboardData {
    guardian_phone: string;
    wards: {
        student: any;
        academic: {
            average: string;
        };
        financial: {
            total: number;
            paid: number;
            balance: number;
        };
    }[];
}

const parentService = {
    getAll: async (params?: any): Promise<ParentRecord[]> => {
        const config = params && Object.keys(params).length > 0 ? { params } : {};
        const res = await api.get('/parents', config);
        return res.data.parents || res.data;
    },

    getDashboard: async (phone: string): Promise<ParentDashboardData> => {
        const res = await api.get(`/parents/dashboard/${phone}`);
        return res.data;
    },

    broadcastStatus: async (phone: string): Promise<any> => {
        const res = await api.post(`/parents/broadcast/${phone}`);
        return res.data;
    }
};

export default parentService;
