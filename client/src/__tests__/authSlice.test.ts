import { configureStore } from '@reduxjs/toolkit';
import authSlice, { login, register, getCurrentUser, logout, clearError } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';

// Mock the authApi
jest.mock('../api/authApi', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    userId: 'user123',
  })),
}));

describe('authSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should have correct initial state when no token in localStorage', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });

    it('should initialize with token from localStorage if valid', () => {
      const mockToken = 'valid-token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const newStore = configureStore({
        reducer: {
          auth: authSlice,
        },
      });

      const state = newStore.getState().auth;
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('reducers', () => {
    it('should handle logout', () => {
      // Set initial authenticated state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          token: 'test-token',
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
        },
      });

      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
      expect(authApi.logout).toHaveBeenCalled();
    });

    it('should handle clearError', () => {
      // Set error state
      store.dispatch({
        type: 'auth/login/rejected',
        payload: 'Login failed',
      });

      store.dispatch(clearError());

      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });

  describe('login async thunk', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
      };

      (authApi.login as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.token).toBe(mockResponse.token);
      expect(state.user).toBe(mockResponse.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    });

    it('should handle login failure', async () => {
      const mockError = 'Invalid credentials';
      (authApi.login as jest.Mock).mockResolvedValue({
        success: false,
        message: mockError,
      });

      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(mockError);
    });

    it('should handle login network error', async () => {
      const mockError = new Error('Network error');
      (authApi.login as jest.Mock).mockRejectedValue(mockError);

      const credentials = { email: 'test@example.com', password: 'password123' };
      await store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should set loading state during login', () => {
      const mockPromise = new Promise(() => {}); // Never resolves
      (authApi.login as jest.Mock).mockReturnValue(mockPromise);

      const credentials = { email: 'test@example.com', password: 'password123' };
      store.dispatch(login(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('register async thunk', () => {
    it('should handle successful registration', async () => {
      const mockResponse = {
        success: true,
        token: 'test-token',
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
      };

      (authApi.register as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      await store.dispatch(register(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.token).toBe(mockResponse.token);
      expect(state.user).toBe(mockResponse.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    });

    it('should handle registration failure', async () => {
      const mockError = 'User already exists';
      (authApi.register as jest.Mock).mockResolvedValue({
        success: false,
        message: mockError,
      });

      const credentials = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };
      await store.dispatch(register(credentials));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });
  });

  describe('getCurrentUser async thunk', () => {
    it('should handle successful user fetch', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockResponse = {
        success: true,
        data: mockUser,
      };

      (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockResponse);

      await store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.user).toBe(mockUser);
      expect(state.error).toBeNull();
    });

    it('should handle user fetch failure', async () => {
      const mockError = 'User not found';
      (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
        success: false,
        message: mockError,
      });

      await store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError);
    });

    it('should handle network error during user fetch', async () => {
      const mockError = new Error('Network error');
      (authApi.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      await store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });
}); 