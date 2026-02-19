import { create } from 'zustand';
import apiClient from '../utils/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loadUser: () => Promise<void>;
  logout: () => void;
  setUserAfterLogin: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUserAfterLogin: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await apiClient.get<{ data: User }>('/auth/me');
        set({ user: res.data.data, isAuthenticated: true });
      } catch (err) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));