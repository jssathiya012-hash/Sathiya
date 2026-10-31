import { create } from 'zustand';
import { api } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  phone?: string;
  avatar?: string;
  staffDetails?: any;
  customerDetails?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string; companyName?: string }) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('smartsub_user') || 'null'),
  token: localStorage.getItem('smartsub_token') || null,
  isAuthenticated: !!localStorage.getItem('smartsub_token'),
  isLoading: false,
  error: null,

  login: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password, rememberMe });
      const { user, token } = res.data;

      localStorage.setItem('smartsub_token', token);
      localStorage.setItem('smartsub_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to log in. Please check credentials.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      const { user, token } = res.data;

      localStorage.setItem('smartsub_token', token);
      localStorage.setItem('smartsub_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('smartsub_token');
    localStorage.removeItem('smartsub_user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkAuth: async () => {
    const token = localStorage.getItem('smartsub_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('smartsub_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('smartsub_token');
      localStorage.removeItem('smartsub_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      localStorage.setItem('smartsub_user', JSON.stringify(updated));
      return { user: updated };
    });
  },
}));
