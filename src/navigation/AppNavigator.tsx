import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';

// Main Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskFormScreen } from '../screens/tasks/TaskFormScreen';
import { MeetingListScreen } from '../screens/meetings/MeetingListScreen';
import { MeetingFormScreen } from '../screens/meetings/MeetingFormScreen';
import { FinanceScreen } from '../screens/finance/FinanceScreen';
import { AddTransactionScreen } from '../screens/finance/AddTransactionScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

import { FontSizes, FontWeights } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TaskStack = createNativeStackNavigator();
const MeetingStack = createNativeStackNavigator();
const FinanceStack = createNativeStackNavigator();

// Task Stack Navigator
const TaskStackNavigator = () => (
  <TaskStack.Navigator screenOptions={{ headerShown: false }}>
    <TaskStack.Screen name="TaskList" component={TaskListScreen} />
    <TaskStack.Screen name="TaskForm" component={TaskFormScreen} />
  </TaskStack.Navigator>
);

// Meeting Stack Navigator
const MeetingStackNavigator = () => (
  <MeetingStack.Navigator screenOptions={{ headerShown: false }}>
    <MeetingStack.Screen name="MeetingList" component={MeetingListScreen} />
    <MeetingStack.Screen name="MeetingForm" component={MeetingFormScreen} />
  </MeetingStack.Navigator>
);

// Finance Stack Navigator
const FinanceStackNavigator = () => (
  <FinanceStack.Navigator screenOptions={{ headerShown: false }}>
    <FinanceStack.Screen name="FinanceMain" component={FinanceScreen} />
    <FinanceStack.Screen name="AddTransaction" component={AddTransactionScreen} />
  </FinanceStack.Navigator>
);

import { HealthStack } from './HealthStack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Bottom Tab Navigator
const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
  
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
            case 'Health':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Finance':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
  
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
          height: 64 + Math.max(insets.bottom, 0),
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: FontWeights.medium,
          marginBottom: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Tasks" component={TaskStackNavigator} />
    <Tab.Screen name="Health" component={HealthStack} />
    <Tab.Screen name="Finance" component={FinanceStackNavigator} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isRestoring } = useAuthStore();
  const { colors, mode } = useTheme();

  if (isRestoring) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
    },
  };

  return (
    <NavigationContainer theme={mode === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
