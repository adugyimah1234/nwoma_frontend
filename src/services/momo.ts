import api from "@/lib/axios";

export interface MomoTransaction {
    external_ref: string;
    amount: number;
    sender_info: string;
    date?: string;
}

export interface ReconcileResult {
    matched: number;
    already_recorded: number;
    failed: number;
    details: {
        ref: string;
        student?: string;
        status: string;
        msg?: string;
        amount?: number;
    }[];
}

const momoService = {
    reconcile: async (transactions: MomoTransaction[]): Promise<ReconcileResult> => {
        const res = await api.post('/momo/reconcile', { transactions });
        return res.data;
    }
};

export default momoService;
