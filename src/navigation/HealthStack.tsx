import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HealthDashboard } from '../modules/health/screens/HealthDashboard';
import { HealthProfileSetup } from '../modules/health/screens/HealthProfileSetup';
import { MealTracker } from '../modules/health/screens/MealTracker';
import { WaterTracker } from '../modules/health/screens/WaterTracker';
import { SleepTracker } from '../modules/health/screens/SleepTracker';
import { WorkoutTracker } from '../modules/health/screens/WorkoutTracker';
import { ExerciseSearch } from '../modules/health/screens/ExerciseSearch';
import { HabitTracker } from '../modules/health/screens/HabitTracker';
import { AnalyticsScreen } from '../modules/health/screens/AnalyticsScreen';
import { ActiveWorkout } from '../modules/health/screens/ActiveWorkout';

const Stack = createNativeStackNavigator();

export const HealthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthDashboard" component={HealthDashboard} />
      <Stack.Screen name="HealthProfileSetup" component={HealthProfileSetup} />
      <Stack.Screen name="MealTracker" component={MealTracker} />
      <Stack.Screen name="WaterTracker" component={WaterTracker} />
      <Stack.Screen name="SleepTracker" component={SleepTracker} />
      <Stack.Screen name="WorkoutTracker" component={WorkoutTracker} />
      <Stack.Screen name="ExerciseSearch" component={ExerciseSearch} />
      <Stack.Screen name="HabitTracker" component={HabitTracker} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkout} />
    </Stack.Navigator>
  );
};
