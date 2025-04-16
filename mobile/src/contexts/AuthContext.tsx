import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  restoreSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    _id: 'bypass-user',
    email: 'bypass@dev.local',
    fullName: 'Bypass Dev',
  });
  const [token, setToken] = useState<string | null>('bypass-token');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provide dummy login/register/logout that do nothing
  const login = async () => {};
  const register = async () => {};
  const logout = async () => {};
  const restoreSession = async () => {};

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};