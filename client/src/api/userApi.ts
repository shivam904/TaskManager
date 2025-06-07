import axiosInstance from './axios';
import { ApiResponse, User } from '../types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

interface UsersResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  data: User[];
  message?: string;
}

export const userApi = {
  getAllUsers: async (page: number = 1, limit: number = 10): Promise<UsersResponse> => {
    try {
      const response = await axiosInstance.get<UsersResponse>(`/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        count: 0,
        total: 0,
        pagination: { page: 1, limit: 10, totalPages: 0 },
        data: [],
        message: 'An error occurred fetching users' 
      } as any;
    }
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred fetching the user' };
    }
  },

  createUser: async (userData: CreateUserData): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>('/users', userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred creating the user' };
    }
  },

  updateUser: async (id: string, userData: UpdateUserData): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred updating the user' };
    }
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred deleting the user' };
    }
  },
}; 