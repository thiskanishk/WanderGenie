import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

// Define types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface LoginPayload {
  token: string;
  refreshToken: string;
  user: User;
}

// Initial state
const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isLoading: true, // Start with true to check for token on app load
  error: null,
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have a token in AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userStr = await AsyncStorage.getItem('user');
      
      // If no token, return null (not logged in)
      if (!token || !userStr) {
        return { token: null, refreshToken: null, user: null };
      }
      
      // Parse user data
      const user = JSON.parse(userStr);
      
      // Check if token is expired
      if (isTokenExpired(token)) {
        // TODO: Implement refresh token logic (call refreshToken API)
        // For now, just return null to log user out
        return { token: null, refreshToken: null, user: null };
      }
      
      return { token, refreshToken, user };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // This would be an API call in a real app
      // const response = await api.post('/auth/login', credentials);
      // const { token, refreshToken, user } = response.data;
      
      // For now, mock a successful login with fake data
      // In a real app, remove this and uncomment the code above
      if (credentials.email !== 'test@example.com' || credentials.password !== 'password') {
        throw new Error('Invalid credentials');
      }
      
      const token = 'fake-jwt-token';
      const refreshToken = 'fake-refresh-token';
      const user = {
        id: '1',
        email: credentials.email,
        firstName: 'Test',
        lastName: 'User',
        roles: ['USER'],
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { token, refreshToken, user };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    });
    builder.addCase(initializeAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    });
    
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<LoginPayload>) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.token = null;
      state.refreshToken = null;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer; 