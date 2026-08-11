import api from "@/lib/axios";

export interface InventoryItem {
    id: string;
    name: string;
    category: 'uniform' | 'book' | 'stationery' | 'other';
    price: number;
    stock_quantity: number;
}

const inventoryService = {
    getAll: async (): Promise<InventoryItem[]> => {
        const res = await api.get('/inventory');
        return res.data;
    },

    create: async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
        const res = await api.post('/inventory', data);
        return res.data;
    },

    update: async (id: string, data: Partial<InventoryItem>): Promise<void> => {
        await api.put(`/inventory/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/inventory/${id}`);
    },

    getReport: async (): Promise<any> => {
        const res = await api.get('/inventory/report');
        return res.data;
    },

    recordSale: async (data: { items: any[], student_id?: string, payment_method: 'cash' | 'debt' }): Promise<void> => {
        await api.post('/inventory/sale', data);
    }
};

export default inventoryService;
