import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

// Define the shape of our context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  clearError: () => void;
}

// Create the Auth Context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  getProfile: async () => {},
  clearError: () => {},
});

// Auth Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          const userData = await authService.getStoredUser();
          setUser(userData);
          setIsLoggedIn(true);
          
          // Optionally refresh user data from the backend
          try {
            await getProfile();
          } catch (error) {
            // If profile fetch fails, just continue with stored data
            console.log('Could not refresh user data');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (fullName: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const userData = await authService.register({ fullName, email, password });
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user profile
  const getProfile = async (): Promise<void> => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Get profile error:', error);
      if (error instanceof Error && error.message.includes('401')) {
        // If unauthorized, logout
        await logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Context value
  const contextValue: AuthContextType = {
    isLoggedIn,
    user,
    loading,
    error,
    login,
    register,
    logout,
    getProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 