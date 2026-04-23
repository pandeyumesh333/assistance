import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { useNotifications } from './src/hooks/useNotifications';
import { registerBackgroundSMSStore } from './src/services/smsListener';

function AppContent() {
  const { restoreSession } = useAuthStore();
  useNotifications();

  useEffect(() => {
    restoreSession();
    // Register background SMS sync for V2
    registerBackgroundSMSStore();
  }, []);


  return (
    <>
      <StatusBar style="dark" />
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
