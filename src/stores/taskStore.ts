import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CreateTaskInput } from '../types';
import { taskAPI } from '../services/api';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
  loadCached: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await taskAPI.getAll();
      // Backend returns tasks array directly
      const tasks = Array.isArray(data) ? data : (data.tasks || []);
      set({ tasks, isLoading: false });
      // Cache for offline
      await AsyncStorage.setItem('cached_tasks', JSON.stringify(tasks));
    } catch (error: any) {
      set({ error: 'Failed to fetch tasks', isLoading: false });
      // Load cached data on failure
      await get().loadCached();
    }
  },

  createTask: async (input: CreateTaskInput) => {
    try {
      set({ error: null });
      const { data } = await taskAPI.create(input);
      // Backend returns the created task directly
      const newTask = data.task || data;
      set({ tasks: [newTask, ...get().tasks] });
    } catch (error: any) {
      set({ error: 'Failed to create task' });
      throw error;
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      set({ error: null });
      const { data } = await taskAPI.update(id, updates);
      // Backend returns the updated task directly
      const updatedTask = data.task || data;
      set({
        tasks: get().tasks.map((t) => (t._id === id ? updatedTask : t)),
      });
    } catch (error: any) {
      set({ error: 'Failed to update task' });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      set({ error: null });
      await taskAPI.delete(id);
      set({ tasks: get().tasks.filter((t) => t._id !== id) });
    } catch (error: any) {
      set({ error: 'Failed to delete task' });
      throw error;
    }
  },

  toggleComplete: async (id: string, completed: boolean) => {
    try {
      const { data } = await taskAPI.update(id, { completed });
      const updatedTask = data.task || data;
      set({
        tasks: get().tasks.map((t) => (t._id === id ? updatedTask : t)),
      });
    } catch (error: any) {
      set({ error: 'Failed to update task' });
    }
  },

  loadCached: async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_tasks');
      if (cached) {
        set({ tasks: JSON.parse(cached), isLoading: false });
      }
    } catch (error) {
      // Ignore cache errors
    }
  },
}));
