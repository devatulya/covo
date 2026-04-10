import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: {
    id: 'user_1',
    username: 'devatulya',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devatulya',
    name: 'Atulya'
  },
  isAuthenticated: true,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
