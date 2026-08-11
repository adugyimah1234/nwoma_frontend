/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export interface academicYear {
  id: string;
  year: string;
  name?: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAcademicYear {
  id?: string;
  year: string;
  name?: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}



export const getAllAcademicYear = async (): Promise<academicYear[]> => {
  try {
    const response = await api.get('/academic-years');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch academic years');
  }
};

export const createAcademicYear = async (data: CreateAcademicYear): Promise<academicYear> => {
  try {
    const response = await api.post('/academic-years', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create academic year');
  }
};

export const updateAcademicYear = async (id: string, data: Partial<CreateAcademicYear>): Promise<academicYear> => {
  try {
    const response = await api.put(`/academic-years/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update academic year');
  }
};

export const deleteAcademicYear = async (id: string): Promise<void> => {
  try {
    await api.delete(`/academic-years/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete academic year');
  }
};
