import { create } from 'zustand';
import { healthAPI } from '../services/healthService';

interface HealthState {
  profile: any | null;
  targets: any | null;
  dailyStats: any | null;
  meals: any[];
  habits: any | null;
  analytics: any[];
  activeWorkout: any | null;
  workoutHistory: any[];
  previousWorkout: any | null;
  isLoading: boolean;
  error: string | null;

  fetchHealthData: (date: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  addMeal: (data: any) => Promise<void>;
  addWater: (quantityMl: number) => Promise<void>;
  logSleep: (data: any) => Promise<void>;
  logExercise: (data: any) => Promise<void>;
  updateHabits: (data: any) => Promise<void>;
  updateHabitsList: (habitsList: any[]) => Promise<void>;
  fetchAnalytics: (days?: number) => Promise<void>;
  
  // Workout Sessions
  startWorkout: (title?: string) => Promise<void>;
  updateActiveWorkout: (data: any) => Promise<void>;
  finishWorkout: () => Promise<void>;
  fetchActiveWorkout: () => Promise<void>;
  fetchWorkoutHistory: (limit?: number) => Promise<void>;
  fetchPreviousWorkout: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  profile: null,
  targets: null,
  dailyStats: null,
  meals: [],
  habits: null,
  analytics: [],
  activeWorkout: null,
  workoutHistory: [],
  previousWorkout: null,
  isLoading: true,
  error: null,

  fetchHealthData: async (date: string) => {
    try {
      set({ isLoading: true, error: null });
      const [profileRes, statsRes, mealsRes, habitsRes] = await Promise.all([
        healthAPI.getProfile(),
        healthAPI.getDailyStats(date),
        healthAPI.getMeals(date),
        healthAPI.getHabits(date),
      ]);

      set({
        profile: profileRes.data.profile,
        targets: profileRes.data.targets,
        dailyStats: statsRes.data,
        meals: mealsRes.data,
        habits: habitsRes.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (data: any) => {
    try {
      set({ isLoading: true });
      const res = await healthAPI.setupProfile(data);
      set({
        profile: res.data.profile,
        targets: res.data.targets,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMeal: async (data: any) => {
    try {
      await healthAPI.addMeal(data);
      const date = new Date(data.timestamp || new Date()).toISOString().split('T')[0];
      await get().fetchHealthData(date);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addWater: async (quantityMl: number) => {
    try {
      await healthAPI.addWater(quantityMl);
      const date = new Date().toISOString().split('T')[0];
      const statsRes = await healthAPI.getDailyStats(date);
      set({ dailyStats: statsRes.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  logSleep: async (data: any) => {
    try {
      await healthAPI.logSleep(data);
      const date = new Date(data.sleepEndTime).toISOString().split('T')[0];
      await get().fetchHealthData(date);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  logExercise: async (data: any) => {
    try {
      await healthAPI.logExercise(data);
      const date = new Date(data.timestamp || new Date()).toISOString().split('T')[0];
      await get().fetchHealthData(date);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateHabits: async (data: any) => {
    try {
      const res = await healthAPI.updateHabits(data);
      set({ habits: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  updateHabitsList: async (habitsList: any[]) => {
    try {
      const res = await healthAPI.updateHabitsList(habitsList);
      set({ profile: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchAnalytics: async (days: number = 7) => {
    try {
      set({ isLoading: true });
      const res = await healthAPI.getAnalytics(days);
      set({ analytics: res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  startWorkout: async (title?: string) => {
    try {
      set({ isLoading: true });
      const res = await healthAPI.startWorkout(title);
      set({ activeWorkout: res.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateActiveWorkout: async (data: any) => {
    try {
      const active = get().activeWorkout;
      if (!active) return;
      const res = await healthAPI.updateWorkout(active._id, data);
      set({ activeWorkout: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  finishWorkout: async () => {
    try {
      const active = get().activeWorkout;
      if (!active) return;
      set({ isLoading: true });
      await healthAPI.finishWorkout(active._id);
      const date = new Date().toISOString().split('T')[0];
      await get().fetchHealthData(date);
      set({ activeWorkout: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchActiveWorkout: async () => {
    try {
      const res = await healthAPI.getActiveWorkout();
      set({ activeWorkout: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchWorkoutHistory: async (limit: number = 10) => {
    try {
      const res = await healthAPI.getWorkoutHistory(limit);
      set({ workoutHistory: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchPreviousWorkout: async () => {
    try {
      const res = await healthAPI.getPreviousWorkoutData();
      set({ previousWorkout: res.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
