/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
// services/auth.ts

import api from "@/lib/axios";

interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  username: string;
  role: string;
  school_id: string | null;
}

export const login = async (username: string, password: string) => {
  const payload: LoginPayload = { username, password };
  const response = await api.post('/auth/login', payload);
  return response.data; // Interceptor unwraps data.data
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const logout = async () => {
  // 6. Security: Persistent Logout - Backend invalidates in Redis
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    console.error("Logout API error:", error);
    throw error;
  }
};

interface ChangePasswordPayload {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const response = await api.post('/auth/change-password', payload);
  return response.data;
};
