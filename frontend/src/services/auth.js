import client from '../api/client';

export const login = async (email, password) => {
  const response = await client.post('/auth/login', { email, password });
  return response.data; // contains access_token, token_type
};

export const register = async (name, email, password) => {
  const response = await client.post('/auth/register', { name, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await client.get('/auth/me');
  return response.data; // response.data.data contains { id, name, email, ... }
};

export const forgotPassword = async (email) => {
  const response = await client.post('/auth/forgot-password', { email });
  return response.data; // response.data contains success status & dev token if local
};

export const resetPassword = async (token, newPassword) => {
  const response = await client.post('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};
