import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meeting, CreateMeetingInput } from '../types';
import { meetingAPI } from '../services/api';

interface MeetingState {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;

  fetchMeetings: () => Promise<void>;
  createMeeting: (input: CreateMeetingInput) => Promise<void>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  loadCached: () => Promise<void>;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  isLoading: false,
  error: null,

  fetchMeetings: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await meetingAPI.getAll();
      set({ meetings: data.meetings || [], isLoading: false });
      await AsyncStorage.setItem('cached_meetings', JSON.stringify(data.meetings));
    } catch (error: any) {
      set({ error: 'Failed to fetch meetings', isLoading: false });
      await get().loadCached();
    }
  },

  createMeeting: async (input: CreateMeetingInput) => {
    try {
      set({ error: null });
      const { data } = await meetingAPI.create(input);
      set({
        meetings: [data.meeting, ...get().meetings].sort((a, b) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
        )
      });
    } catch (error: any) {
      set({ error: 'Failed to create meeting' });
      throw error;
    }
  },

  updateMeeting: async (id: string, updates: Partial<Meeting>) => {
    try {
      set({ error: null });
      const { data } = await meetingAPI.update(id, updates);
      set({
        meetings: get().meetings.map((m) => (m._id === id ? data.meeting : m)),
      });
    } catch (error: any) {
      set({ error: 'Failed to update meeting' });
      throw error;
    }
  },

  deleteMeeting: async (id: string) => {
    try {
      set({ error: null });
      await meetingAPI.delete(id);
      set({ meetings: get().meetings.filter((m) => m._id !== id) });
    } catch (error: any) {
      set({ error: 'Failed to delete meeting' });
      throw error;
    }
  },

  loadCached: async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_meetings');
      if (cached) {
        set({ meetings: JSON.parse(cached), isLoading: false });
      }
    } catch (error) { }
  },
}));
