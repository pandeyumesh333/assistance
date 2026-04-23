import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const { mode, colors, toggleTheme } = useThemeStore();
  
  return {
    mode,
    colors,
    toggleTheme,
    isDark: mode === 'dark',
  };
};
