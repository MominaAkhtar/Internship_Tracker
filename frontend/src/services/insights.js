import client from '../api/client';

export const getOverview = async () => {
  const response = await client.get('/career-insights/overview');
  return response.data;
};

export const getStatusAnalysis = async () => {
  const response = await client.get('/career-insights/status-analysis');
  return response.data;
};

export const getCompanyAnalysis = async () => {
  const response = await client.get('/career-insights/company-analysis');
  return response.data;
};

export const getResponseTimeAnalysis = async () => {
  const response = await client.get('/career-insights/response-time');
  return response.data;
};

export const getMonthlyTrends = async () => {
  const response = await client.get('/career-insights/monthly-trends');
  return response.data;
};

export const getWeeklyConsistency = async () => {
  const response = await client.get('/career-insights/weekly-consistency');
  return response.data;
};
