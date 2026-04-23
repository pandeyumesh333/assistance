import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuthStore } from '../stores/authStore';

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

import { Colors, FontSizes, FontWeights, Shadows } from '../constants/theme';

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
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
          height: 64 + Math.max(insets.bottom, 0),
          ...Shadows.sm,
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

  if (isRestoring) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
