import express from 'express';
import {
  setupProfile,
  getProfile,
  getDailyStats,
  addMeal,
  getMeals,
  addWater,
  logSleep,
  logExercise,
  getExercises,
  updateHabits,
  updateHabitsList,
  getHabits,
  getAnalytics,
  startWorkout,
  getActiveWorkout,
  updateWorkout,
  finishWorkout,
  getWorkoutHistory,
  getPreviousWorkoutData,
} from '../../controllers/health/healthController';
import { protect } from '../../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/profile').get(getProfile).post(setupProfile);
router.route('/stats/daily').get(getDailyStats);
router.route('/meals').get(getMeals).post(addMeal);
router.route('/water').post(addWater);
router.route('/sleep').post(logSleep);
router.route('/exercise').post(logExercise);
router.route('/exercises/library').get(getExercises);
router.route('/habits').get(getHabits).post(updateHabits);
router.route('/habits/list').post(updateHabitsList);
router.route('/analytics').get(getAnalytics);

router.route('/workout/active').get(getActiveWorkout);
router.route('/workout/start').post(startWorkout);
router.route('/workout/history').get(getWorkoutHistory);
router.route('/workout/previous').get(getPreviousWorkoutData);
router.route('/workout/:workoutId').put(updateWorkout).post(finishWorkout);

export default router;
