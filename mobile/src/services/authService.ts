import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API calls
const API_URL = 'http://192.168.1.4:5000/api/auth'; // Replace with your backend URL

// Storage keys
const TOKEN_KEY = '@wandergenie_token';
const USER_KEY = '@wandergenie_user';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  errors?: any[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  provider: string;
  createdAt: string;
}

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>('/login', credentials);
    
    if (response.data.success && response.data.data) {
      // Store token and user data
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.tokens.accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Authentication failed');
    }
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await api.post<AuthResponse>('/register', userData);
    
    if (response.data.success && response.data.data) {
      // Store token and user data
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.tokens.accessToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      
      return response.data.data.user;
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw error;
  }
};

/**
 * Get authenticated user profile
 */
export const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get<{ success: boolean; data: { user: User } }>('/me');
    
    if (response.data.success) {
      // Update stored user data
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data.user));
      return response.data.data.user;
    } else {
      throw new Error('Failed to fetch profile');
    }
  } catch (error) {
    console.error('Get profile error:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // Token expired or invalid
        await logout();
      }
      throw new Error(error.response.data.message || 'Failed to fetch profile');
    }
    throw error;
  }
};

/**
 * Logout user by removing stored token and user data
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Check if user is currently logged in
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

/**
 * Get stored user information
 */
export const getStoredUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Get stored user error:', error);
    return null;
  }
};

export default {
  login,
  register,
  getProfile,
  logout,
  isAuthenticated,
  getStoredUser
}; 