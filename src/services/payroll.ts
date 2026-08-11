import api from "@/lib/axios";

export interface PayrollStaffSetting {
    user_id: string;
    full_name: string;
    role_name: string;
    base_salary: number;
    allowances: number;
    deductions: number;
}

export interface PayrollRecord {
    id: string;
    staff_name: string;
    role_name: string;
    month: number;
    year: number;
    base_salary: number;
    allowances: number;
    deductions: number;
    net_salary: number;
    payment_status: 'draft' | 'approved' | 'paid';
    payment_date: string | null;
}

const payrollService = {
    getStaffSettings: async (): Promise<PayrollStaffSetting[]> => {
        const res = await api.get('/payroll/settings');
        return res.data;
    },

    updateSettings: async (data: Partial<PayrollStaffSetting>): Promise<void> => {
        await api.post('/payroll/settings', data);
    },

    generateDraft: async (month: number, year: number): Promise<any> => {
        const res = await api.post('/payroll/generate', { month, year });
        return res.data;
    },

    getHistory: async (month: number, year: number): Promise<PayrollRecord[]> => {
        const res = await api.get('/payroll/history', { params: { month, year } });
        return res.data;
    },

    payStaff: async (id: string): Promise<void> => {
        await api.patch(`/payroll/${id}/pay`);
    }
};

export default payrollService;
