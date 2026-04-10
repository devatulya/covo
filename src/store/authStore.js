import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'covo-auth';

const defaultUser = {
  id: 'user_1',
  username: 'devatulya',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=devatulya',
  name: 'Atulya',
  bio: 'Design major. Coffee addict. Making things break since 03.',
  major: 'Computer Science (BS)',
  communities: ['Varsity Football', 'Graphic Design', 'Chess Society'],
  year: "'26",
  notificationsEnabled: true,
};

function getInitialAuthState() {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }

  const storedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!storedAuth) {
    return { user: null, isAuthenticated: false };
  }

  try {
    const parsedAuth = JSON.parse(storedAuth);
    if (parsedAuth?.user && parsedAuth?.isAuthenticated) {
      return parsedAuth;
    }
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return { user: null, isAuthenticated: false };
}

function persistAuth(nextState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
}

function clearAuth() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

const initialAuthState = getInitialAuthState();

export const useAuthStore = create((set) => ({
  user: initialAuthState.user,
  isAuthenticated: initialAuthState.isAuthenticated,

  login: (userData) => {
    const nextUser = {
      ...defaultUser,
      ...userData,
    };

    const nextState = { user: nextUser, isAuthenticated: true };
    persistAuth(nextState);
    set(nextState);
  },

  logout: () => {
    clearAuth();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: (partialUser) =>
    set((state) => {
      const nextState = {
        user: { ...state.user, ...partialUser },
        isAuthenticated: state.isAuthenticated,
      };

      if (nextState.user && nextState.isAuthenticated) {
        persistAuth(nextState);
      }

      return nextState;
    }),

  toggleNotifications: () =>
    set((state) => {
      const nextState = {
        user: {
          ...state.user,
          notificationsEnabled: !state.user?.notificationsEnabled,
        },
        isAuthenticated: state.isAuthenticated,
      };

      if (nextState.user && nextState.isAuthenticated) {
        persistAuth(nextState);
      }

      return nextState;
    }),
}));
