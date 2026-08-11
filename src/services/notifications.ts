import api from '@/lib/axios';

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  school_id: string | null;
  garrison_id: string | null;
  created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};
