import client from '../api/client';

export const getActivityLogs = async () => {
  const response = await client.get('/activity-logs/');
  return response.data; // Array of ActivityLogResponse
};

export const getActivityLog = async (logId) => {
  const response = await client.get(`/activity-logs/${logId}`);
  return response.data;
};
