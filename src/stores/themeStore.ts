import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { ThemeMode, LightColors, DarkColors } from '../constants/theme';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof LightColors;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  colors: LightColors,

  toggleTheme: async () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    const newColors = newMode === 'light' ? LightColors : DarkColors;
    
    await SecureStore.setItemAsync('theme_mode', newMode);
    set({ mode: newMode, colors: newColors });
  },

  loadTheme: async () => {
    const savedMode = await SecureStore.getItemAsync('theme_mode');
    if (savedMode === 'dark' || savedMode === 'light') {
      set({ 
        mode: savedMode as ThemeMode, 
        colors: savedMode === 'light' ? LightColors : DarkColors 
      });
    }
  },
}));
