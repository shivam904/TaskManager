// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Task types
export interface TaskDocument {
  _id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export interface TaskComment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: User | string;
  createdBy: User | string;
  documents: TaskDocument[];
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

// Authentication credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  token?: string;
  message?: string;
  errors?: any[];
} 