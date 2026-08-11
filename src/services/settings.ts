import api from "@/lib/axios";

export interface Setting {
  id?: number;
  setting_group: string;
  setting_key: string;
  setting_value: any;
  created_at?: string;
  updated_at?: string;
}

const settingService = {
  getAll: async (): Promise<Setting[]> => {
    const res = await api.get('/settings');
    return res.data;
  },

  getByGroup: async (groupName: string): Promise<Setting[]> => {
    const res = await api.get(`/settings/group/${groupName}`);
    return res.data;
  },

  create: async (setting: Omit<Setting, "id" | "created_at" | "updated_at">): Promise<{ message: string, setting: Setting }> => {
    const res = await api.post('/settings', setting);
    return res.data;
  },

  update: async (id: number, setting: Omit<Setting, "id" | "created_at" | "updated_at">): Promise<{ message: string, setting: Setting }> => {
    const res = await api.put(`/settings/${id}`, setting);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/settings/${id}`);
  },
};

export default settingService;
