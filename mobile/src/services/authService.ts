import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api/auth'
  : 'http://localhost:5000/api/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 5000, // 5 seconds for faster error feedback
});

export interface User {
  _id: string;
  email: string;
  fullName?: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await axiosInstance.post('/login', { email, password });
  await AsyncStorage.setItem('accessToken', res.data.accessToken);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

async function register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const res = await axiosInstance.post('/register', { email, password, fullName });
  await AsyncStorage.setItem('accessToken', res.data.accessToken);
  await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data;
}

async function logout() {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('user');
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('accessToken');
}

async function getUser(): Promise<User | null> {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export default {
  login,
  register,
  logout,
  getToken,
  getUser,
  isAuthenticated,
};