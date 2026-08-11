import api from '@/lib/axios';

export interface SuperAdminSummary {
  totalGarrisons: number;
  totalSchools: number;
  totalStudents: number;
  totalDirectors: number;
  totalCollections: number;
  pendingPayments: number;
  outstandingBalance: number;
  categoryRevenue?: { category: string; total: number }[];
}

export interface GarrisonPerformance {
  garrison_id: string;
  garrison_name: string;
  code: string;
  location: string;
  total_schools: number;
  total_students: number;
  director_name: string | null;
  total_collected: number;
}

export interface SchoolPerformance {
  school_id: string;
  school_name: string;
  email: string | null;
  phone_number: string | null;
  garrison_name: string | null;
  garrison_id: string;
  total_students: number;
  active_students: number;
  total_staff: number;
  fee_collected: number;
  pending_amount?: number;
}

export interface ExecutiveDashboardData {
  summary: SuperAdminSummary;
  garrisonsPerformance: GarrisonPerformance[];
  schoolsPerformance: SchoolPerformance[];
}

export interface Garrison {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  created_at: string;
  school_count?: number;
  director_id?: string;
  director_name?: string;
}

export interface GarrisonDirectorUser {
  id: string;
  full_name: string;
  username: string;
  email: string | null;
  created_at: string;
  garrison_id: string | null;
  garrison_name: string | null;
}

export const getSuperAdminDashboard = async (): Promise<ExecutiveDashboardData> => {
  const res = await api.get('/super-admin/dashboard');
  return res.data;
};

export const getAllGarrisons = async (): Promise<Garrison[]> => {
  const res = await api.get('/super-admin/garrisons');
  return res.data;
};

export const createGarrison = async (data: { name: string; code?: string; location?: string }): Promise<{ id: string; message: string }> => {
  const res = await api.post('/super-admin/garrisons', data);
  return res.data;
};

export const updateGarrison = async (id: string, data: { name: string; code?: string; location?: string }): Promise<void> => {
  await api.put(`/super-admin/garrisons/${id}`, data);
};

export const deleteGarrison = async (id: string): Promise<void> => {
  await api.delete(`/super-admin/garrisons/${id}`);
};

export const updateBranding = async (data: FormData): Promise<void> => {
    await api.put('/super-admin/branding', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const getBranding = async (): Promise<any> => {
    const res = await api.get('/super-admin/branding');
    return res.data;
};

export const updateGradeGovernance = async (data: any): Promise<void> => {
    await api.put('/super-admin/grade-governance', data);
};

export const getCommunicationSettings = async (): Promise<any> => {
    const res = await api.get('/super-admin/communication-settings');
    return res.data;
};

export const updateCommunicationSettings = async (data: any): Promise<void> => {
    await api.put('/super-admin/communication-settings', data);
};

export const getApiToken = async (): Promise<{ token: string | null }> => {
    const res = await api.get('/super-admin/api-token');
    return res.data;
};

export const regenerateApiToken = async (): Promise<{ token: string }> => {
    const res = await api.post('/super-admin/api-token/regenerate');
    return res.data;
};

export const updateAdminProfile = async (data: any): Promise<void> => {
    await api.put('/super-admin/profile', data);
};

export const getGarrisonDirectors = async (): Promise<GarrisonDirectorUser[]> => {
  const res = await api.get('/super-admin/garrison-directors');
  return res.data;
};

export const createGarrisonDirector = async (data: {
  full_name: string;
  username: string;
  email?: string;
  password?: string;
  garrison_id: string;
}): Promise<{ id: string; message: string }> => {
  const res = await api.post('/super-admin/garrison-directors', data);
  return res.data;
};
