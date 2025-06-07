import axiosInstance from './axios';
import { ApiResponse, Task } from '../types';

export const taskApi = {
  getAllTasks: async (): Promise<ApiResponse<Task[]>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Task[]>>('/tasks');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred fetching tasks' };
    }
  },

  getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<Task>>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred fetching the task' };
    }
  },

  createTask: async (taskData: FormData): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Task>>('/tasks', taskData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred creating the task' };
    }
  },

  updateTask: async (id: string, taskData: FormData): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<Task>>(`/tasks/${id}`, taskData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred updating the task' };
    }
  },

  deleteTask: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred deleting the task' };
    }
  },

  updateTaskStatus: async (id: string, status: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred updating the task status' };
    }
  },

  deleteDocument: async (taskId: string, docId: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<Task>>(`/tasks/${taskId}/documents/${docId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred deleting the document' };
    }
  },

  addComment: async (taskId: string, text: string): Promise<ApiResponse<Task>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<Task>>(`/tasks/${taskId}/comments`, { text });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'An error occurred adding the comment' };
    }
  },
}; 