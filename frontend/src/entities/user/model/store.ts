import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  userName: string | null;
  role: 'admin' | 'volunteer' | null;
  login: (name: string, role: 'admin' | 'volunteer') => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  userName: null,
  role: null,
  login: (name, role) => set({ isAuthenticated: true, userName: name, role }),
  logout: () => set({ isAuthenticated: false, userName: null, role: null }),
}));
