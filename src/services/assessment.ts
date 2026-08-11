import api from '@/lib/axios';
import { type Assessment, type CreateAssessmentInput } from '@/types/assessment';

export const getAssessments = async (): Promise<Assessment[]> => {
  const res = await api.get<Assessment[]>('/assessments');
  return res.data;
};

export const getAssessmentById = async (id: string): Promise<Assessment> => {
  const res = await api.get<Assessment>(`/assessments/${id}`);
  return res.data;
};

export const createAssessment = async (data: CreateAssessmentInput): Promise<{ insertId: string }> => {
  const res = await api.post('/assessments', data);
  return res.data;
};

export const updateAssessment = async (id: string, data: CreateAssessmentInput): Promise<void> => {
  await api.put(`/assessments/${id}`, data);
};

export const deleteAssessment = async (id: string): Promise<void> => {
  await api.delete(`/assessments/${id}`);
};
