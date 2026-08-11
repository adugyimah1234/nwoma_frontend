import api from "@/lib/axios";

export interface ExpenseRecord {
    id: string;
    category: 'utilities' | 'maintenance' | 'supplies' | 'salaries' | 'rent' | 'other';
    amount: number;
    description: string;
    expense_date: string;
    recorded_by_name: string;
    school_name?: string;
}

export interface ExpenseSummary {
    total_expenses: number;
    category: string;
    count: number;
}

const expenseService = {
    getAll: async (params?: any): Promise<ExpenseRecord[]> => {
        const res = await api.get('/expenses', { params });
        return res.data;
    },

    create: async (data: Partial<ExpenseRecord>): Promise<ExpenseRecord> => {
        const res = await api.post('/expenses', data);
        return res.data;
    },

    getSummary: async (): Promise<ExpenseSummary[]> => {
        const res = await api.get('/expenses/summary');
        return res.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/expenses/${id}`);
    }
};

export default expenseService;
