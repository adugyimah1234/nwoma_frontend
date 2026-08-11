import api from "@/lib/axios";

export interface DisciplineLog {
    id: string;
    student_id: string;
    offense: string;
    action_taken: string;
    date_occurred: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recorded_by_name?: string;
}

const disciplineService = {
    getByStudent: async (studentId: string): Promise<DisciplineLog[]> => {
        const res = await api.get(`/discipline/student/${studentId}`);
        return res.data;
    },

    create: async (data: Partial<DisciplineLog>): Promise<void> => {
        await api.post('/discipline', data);
    }
};

export default disciplineService;
