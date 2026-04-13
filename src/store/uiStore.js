import { create } from 'zustand';

const THEME_STORAGE_KEY = 'covo-theme';

const defaultNotifications = [
  {
    id: 'notif_1',
    title: 'New campus blast',
    body: 'Robotics Club just dropped the schedule for the weekend hack sprint.',
    time: '2m ago',
    accent: 'bg-neoYellow',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'Your post is trending',
    body: 'The meme you posted in College feed is pulling serious attention.',
    time: '18m ago',
    accent: 'bg-neoPink',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Scene update',
    body: 'Weekend Warriors opened 4 new spots for tonight.',
    time: '1h ago',
    accent: 'bg-neoCyan',
    read: true,
  },
];

const defaultDrafts = [
  {
    id: 'draft_1',
    title: 'Library leak',
    zone: 'Library Board',
    content: 'Midnight crowd at the library is louder than the fest stage.',
    updatedAt: 'Saved 8m ago',
    ghostMode: true,
  },
  {
    id: 'draft_2',
    title: 'Cafeteria drop',
    zone: 'Campus Pulse',
    content: 'Friday menu might finally be worth showing up for.',
    updatedAt: 'Saved 1h ago',
    ghostMode: false,
  },
];

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  // Default strictly to light mode instead of matching system preferences
  return 'light';
}

function applyTheme(theme) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export const useUiStore = create((set, get) => ({
  theme: getInitialTheme(),
  activeTab: 'COLLEGE',
  isNotificationsOpen: false,
  isDraftsOpen: false,
  notifications: defaultNotifications,
  drafts: defaultDrafts,

  initializeTheme: () => {
    const theme = getInitialTheme();
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    set({ theme: nextTheme });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  openNotifications: () => set({ isNotificationsOpen: true }),
  closeNotifications: () => set({ isNotificationsOpen: false }),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),

  openDrafts: () => set({ isDraftsOpen: true }),
  closeDrafts: () => set({ isDraftsOpen: false }),
  getDraftById: (draftId) => get().drafts.find((draft) => draft.id === draftId) ?? null,
}));
