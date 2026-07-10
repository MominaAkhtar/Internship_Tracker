import client from '../api/client';

export const getNotifications = async () => {
  const response = await client.get('/notifications/');
  return response.data; // Array of NotificationResponse
};

export const getNotificationCount = async () => {
  const response = await client.get('/notifications/count');
  return response.data; // integer or object (FastAPI router returns raw count)
};

export const markAllRead = async () => {
  const response = await client.patch('/notifications/read-all');
  return response.data;
};

export const getNotification = async (notificationId) => {
  const response = await client.get(`/notifications/${notificationId}`);
  return response.data;
};

export const markRead = async (notificationId) => {
  const response = await client.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await client.delete(`/notifications/${notificationId}`);
  return response.data;
};
