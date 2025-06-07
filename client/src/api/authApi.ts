import axiosInstance from './axios';
import { ApiResponse, LoginCredentials, RegisterCredentials, User } from '../types';

interface UpdateUserData {
  name?: string;
  email?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred during login' };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<User>>('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred during registration' };
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred fetching user data' };
    }
  },

  updateUser: async (userData: UpdateUserData): Promise<ApiResponse<User>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<User>>('/auth/me', userData);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred updating user profile' };
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
  }
}; 