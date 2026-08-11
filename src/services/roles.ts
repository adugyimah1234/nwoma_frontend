/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/axios';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleDTO {
  name: string;
  description: string;
  permissions?: string[];
}

export interface CreateUserDTO {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: string; // This will now come from your roles API
  school_id?: string | null;
}

export interface UpdateRoleDTO extends Partial<CreateRoleDTO> {}

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch roles');
  }
};

export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch role');
  }
};

export const createRole = async (data: CreateRoleDTO): Promise<Role> => {
  try {
    const response = await api.post('/roles', data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to create role');
  }
};

export const updateRole = async (id: string, data: UpdateRoleDTO): Promise<Role> => {
  try {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to update role');
  }
};

export const deleteRole = async (id: string): Promise<void> => {
  try {
    await api.delete(`/roles/${id}`);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete role');
  }
};