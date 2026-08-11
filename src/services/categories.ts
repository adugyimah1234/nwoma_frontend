/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  amount: number;
  school_id: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryDTO {
  name: string;
  code: string;
  description: string;
  amount: number;
  status?: 'active' | 'inactive';
  school_id?: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const createCategory = async (data: CreateCategoryDTO): Promise<Category> => {
  try {
    const response = await api.post('/categories', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create category');
  }
};

export const updateCategory = async (id: string, data: Partial<CreateCategoryDTO>): Promise<Category> => {
  try {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update category');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete category');
  }
};
