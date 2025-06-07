import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../../api/userApi';
import { User } from '../../types';

interface UserState {
  users: User[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  total: 0,
  pagination: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getAllUsers(params.page, params.limit);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch users');
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer; 