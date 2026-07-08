import client from '../api/client';

export const getDashboardSummary = async () => {
  const response = await client.get('/dashboard/summary');
  return response.data; // DashboardSummary model
};

export const getRecentApplications = async () => {
  const response = await client.get('/dashboard/recent');
  return response.data; // Array of RecentApplication
};

export const getUpcomingInterviews = async () => {
  const response = await client.get('/dashboard/interviews');
  return response.data; // Array of RecentApplication
};

export const getStatusCounts = async () => {
  const response = await client.get('/dashboard/status');
  return response.data; // dict of status counts
};
