import api from '../../../services/api';

export const healthAPI = {
  getProfile: () => api.get('/health/profile'),
  setupProfile: (data: any) => api.post('/health/profile', data),
  getDailyStats: (date: string) => api.get('/health/stats/daily', { params: { date } }),
  addMeal: (data: any) => api.post('/health/meals', data),
  getMeals: (date: string) => api.get('/health/meals', { params: { date } }),
  addWater: (quantityMl: number, timestamp: Date = new Date()) => 
    api.post('/health/water', { quantityMl, timestamp }),
  logSleep: (data: { sleepStartTime: Date; sleepEndTime: Date; sleepQualityScore: number }) =>
    api.post('/health/sleep', data),
  logExercise: (data: any) => api.post('/health/exercise', data),
  getExercises: (params?: { search?: string; type?: string; difficulty?: string }) =>
    api.get('/health/exercises/library', { params }),
  getHabits: (date: string) => api.get('/health/habits', { params: { date } }),
  updateHabits: (data: any) => api.post('/health/habits', data),
  getAnalytics: (days: number = 7) => api.get('/health/analytics', { params: { days } }),
  startWorkout: (title?: string) => api.post('/health/workout/start', { title }),
  getActiveWorkout: () => api.get('/health/workout/active'),
  updateWorkout: (workoutId: string, data: any) => api.put(`/health/workout/${workoutId}`, data),
  finishWorkout: (workoutId: string) => api.post(`/health/workout/${workoutId}`),
  getWorkoutHistory: (limit: number = 10) => api.get('/health/workout/history', { params: { limit } }),
  getPreviousWorkoutData: () => api.get('/health/workout/previous'),
};
