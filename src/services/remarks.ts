import api from "@/lib/axios";

export interface RemarkItem {
    id: string;
    category: 'academic' | 'conduct' | 'general' | 'interest';
    remark_text: string;
}

const remarksService = {
    getAll: async (): Promise<RemarkItem[]> => {
        const res = await api.get('/remarks');
        return res.data;
    },

    create: async (data: Partial<RemarkItem>): Promise<RemarkItem> => {
        const res = await api.post('/remarks', data);
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/remarks/${id}`);
    }
};

export default remarksService;
