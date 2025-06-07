import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { AuthState, LoginCredentials, RegisterCredentials, User } from '../../types';
import { jwtDecode } from 'jwt-decode';

// Check if token exists in localStorage and is valid
const checkAuthToken = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { token: null, user: null };
  }

  try {
    const decodedToken: any = jwtDecode(token);
    const expirationTime = decodedToken.exp * 1000;

    if (expirationTime < Date.now()) {
      localStorage.removeItem('token');
      return { token: null, user: null };
    }
    
    return { token, user: null };
  } catch (error) {
    localStorage.removeItem('token');
    return { token: null, user: null };
  }
};

const initialState: AuthState = {
  token: checkAuthToken().token,
  user: null,
  isAuthenticated: !!checkAuthToken().token,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      if (!response.success) {
        return rejectWithValue(response.message || 'Login failed');
      }
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.register(credentials);
      if (!response.success) {
        return rejectWithValue(response.message || 'Registration failed');
      }
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch user');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData: { name?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.updateUser(userData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update user');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      authApi.logout();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.user = action.payload.data;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 