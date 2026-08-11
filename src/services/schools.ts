import api from "@/lib/axios";
import { type School } from "@/types/school";

const schoolService = {
  // 🔹 Fetch
  getAll: async (): Promise<School[]> => {
    const res = await api.get('/schools');
    return res.data;
  },

  getById: async (id: string): Promise<School> => {
    const res = await api.get(`/schools/${id}`);
    return res.data;
  },

  // 🔹 Create/Update/Delete
  create: async (school: Partial<Omit<School, "id">>): Promise<{ id: string }> => {
    const res = await api.post('/schools', school);
    return res.data;
  },

  update: async (id: string, school: Partial<Omit<School, "id">>): Promise<School> => {
    const res = await api.put(`/schools/${id}`, school);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/schools/${id}`);
  },

  // 🔹 Search by attribute
  search: async (params: any): Promise<School[]> => {
    const res = await api.get('/schools', { params });
    return res.data;
  }
};

export default schoolService;
