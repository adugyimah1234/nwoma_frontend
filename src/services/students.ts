import api from "@/lib/axios";
import { type CreateStudentPayload, type Student } from "@/types/student";

const studentService = {
  // Partial update (PUT /students/:id)
  updatePartial: async (id: string, data: Partial<CreateStudentPayload>) => {
    const res = await api.put(`/students/${id}`, data);
    return res.data;
  },

  create: async (data: CreateStudentPayload) => {
    const res = await api.post('/students', data);
    return res.data;
  },

  getAll: async (params?: any) => {
    // Standardize GET request: don't pass params object if it's empty
    const config = params && Object.keys(params).length > 0 ? { params } : {};
    const res = await api.get('/students', config);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },

  promote: async (id: string, newClassId?: string) => {
    const res = await api.post(`/students/${id}/promote`, { class_id: newClassId });
    return res.data;
  },

  transfer: async (id: string, newSchoolId: string, newClassId: string) => {
    const res = await api.post(`/students/${id}/transfer`, {
      school_id: newSchoolId,
      class_id: newClassId,
    });
    return res.data;
  },

  enroll: async (id: string, class_id: string, school_id: string) => {
    const res = await api.post(`/students/${id}/enroll`, {
      class_id,
      school_id,
    });
    return res.data;
  },

  remove: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
};

export const getStudents = studentService.getAll;
export default studentService;
