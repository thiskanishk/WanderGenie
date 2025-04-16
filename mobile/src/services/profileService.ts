import axios from 'axios';

const API_BASE_URL = '/api/user';

export const getProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/me`);
  return response.data;
};

export const updatePersonalInfo = async (data: { fullName?: string; phone?: string; country?: string; language?: string }) => {
  const response = await axios.patch(`${API_BASE_URL}/me`, data);
  return response.data;
};

export const savePreferences = async (data: { budget?: string; tripType?: string; currency?: string; distanceUnit?: string; interests?: string[] }) => {
  const response = await axios.post(`${API_BASE_URL}/preferences`, data);
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await axios.post(`${API_BASE_URL}/change-password`, {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const toggle2FA = async (enable: boolean) => {
  const response = await axios.post(`${API_BASE_URL}/toggle-2fa`, { enable });
  return response.data;
};

export const logoutAllDevices = async () => {
  const response = await axios.post(`${API_BASE_URL}/logout-all`);
  return response.data;
};

export const deleteAccount = async (password: string) => {
  const response = await axios.delete(`${API_BASE_URL}/delete`, {
    data: { password },
  });
  return response.data;
};