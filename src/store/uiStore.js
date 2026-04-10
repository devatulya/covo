import { create } from 'zustand';

export const useUiStore = create((set) => ({
  theme: 'dark',
  activeTab: 'College', // College, Sub-communities, My Feed
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if(newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  
  setActiveTab: (tab) => set({ activeTab: tab })
}));
