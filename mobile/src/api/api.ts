import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { Alert } from 'react-native';

const API_URL = 'http://10.0.2.2:5000/api'; // Change as needed

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Request: Attach token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response: Handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await authService.logout();
      Alert.alert('Session Expired', 'Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
