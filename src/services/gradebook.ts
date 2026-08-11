import api from "@/lib/axios";

export interface Subject {
    id: string;
    name: string;
    code: string;
}

export interface AcademicTerm {
    id: string;
    name: string;
    is_active: boolean;
}

export interface StudentMark {
    student_id: string;
    first_name: string;
    last_name: string;
    ca_score: number;
    exam_score: number;
    total_score: number;
    grade: string;
    teacher_remarks: string;
}

const gradebookService = {
    getSubjects: async (): Promise<Subject[]> => {
        const res = await api.get('/gradebook/subjects');
        return res.data;
    },

    getTerms: async (academicYearId?: string): Promise<AcademicTerm[]> => {
        const res = await api.get('/gradebook/terms', { params: { academicYearId } });
        return res.data;
    },

    createSubject: async (data: { name: string, code: string }): Promise<Subject> => {
        const res = await api.post('/gradebook/subjects', data);
        return res.data;
    },

    getClassMarks: async (classId: string, termId: string, subjectId: string): Promise<StudentMark[]> => {
        const res = await api.get('/gradebook/marks', { params: { classId, termId, subjectId } });
        return res.data;
    },

    saveMarks: async (data: { subject_id: string, term_id: string, marks: any[] }): Promise<void> => {
        await api.post('/gradebook/marks', data);
    },

    getStudentReport: async (studentId: string, termId: string): Promise<any> => {
        const res = await api.get(`/gradebook/report/${studentId}/${termId}`);
        return res.data;
    },

    broadcastResults: async (data: { student_id?: string, class_id?: string, term_id: string, type?: 'results' | 'achievement' }): Promise<void> => {
        await api.post('/gradebook/broadcast', data);
    }
};

export default gradebookService;
