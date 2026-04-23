import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useNotifications } from './src/hooks/useNotifications';
import { registerBackgroundSMSStore } from './src/services/smsListener';

import { useThemeStore } from './src/stores/themeStore';

function AppContent() {
  const { restoreSession } = useAuthStore();
  const { mode, loadTheme } = useThemeStore();
  useNotifications();

  useEffect(() => {
    restoreSession();
    loadTheme();
    // Register background SMS sync for V2
    registerBackgroundSMSStore();
  }, []);

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
