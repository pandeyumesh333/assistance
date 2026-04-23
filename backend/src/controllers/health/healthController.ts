import { Request, Response } from 'express';
import { HealthProfile } from '../../models/health/HealthProfile';
import { NutritionTargets } from '../../models/health/NutritionTargets';
import { DailyHealthStats } from '../../models/health/DailyHealthStats';
import { MealLog } from '../../models/health/MealLog';
import { WaterLog } from '../../models/health/WaterLog';
import { SleepLog } from '../../models/health/SleepLog';
import { ExerciseLog } from '../../models/health/ExerciseLog';
import { HabitLog } from '../../models/health/HabitLog';
import { DailyHealthScore } from '../../models/health/DailyHealthScore';
import { ExerciseLibrary } from '../../models/health/ExerciseLibrary';
import { WorkoutSession } from '../../models/health/WorkoutSession';
import { calculateBMI, calculateNutritionTargets, calculateDailyHealthScore } from '../../services/health/healthCalculator';

// --- Health Profile ---

export const setupProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { heightCm, weightKg, age, gender, activityLevel, fitnessGoal } = req.body;

    const bmi = calculateBMI(weightKg, heightCm);

    let profile = await HealthProfile.findOneAndUpdate(
      { userId },
      { heightCm, weightKg, age, gender, activityLevel, fitnessGoal, bmi },
      { new: true, upsert: true }
    );

    const targetsData = calculateNutritionTargets(profile);
    const targets = await NutritionTargets.findOneAndUpdate(
      { userId },
      { ...targetsData },
      { new: true, upsert: true }
    );

    res.status(200).json({ profile, targets });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const profile = await HealthProfile.findOne({ userId });
    const targets = await NutritionTargets.findOne({ userId });
    res.status(200).json({ profile, targets });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabitsList = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { habitsList } = req.body;
    const profile = await HealthProfile.findOneAndUpdate(
      { userId },
      { habitsList },
      { new: true }
    );
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Daily Stats & Sync ---

const updateDailyStats = async (userId: string, date: string) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [meals, water, sleep, exercises, sessions] = await Promise.all([
    MealLog.find({ userId, timestamp: { $gte: startOfDay, $lte: endOfDay } }),
    WaterLog.find({ userId, timestamp: { $gte: startOfDay, $lte: endOfDay } }),
    SleepLog.find({ userId, createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    ExerciseLog.find({ userId, timestamp: { $gte: startOfDay, $lte: endOfDay }, completed: true }),
    WorkoutSession.find({ userId, endTime: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' }),
  ]);

  const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = meals.reduce((sum, m) => sum + m.protein, 0);
  const waterConsumed = water.reduce((sum, w) => sum + w.quantityMl, 0);
  const sleepHours = sleep.reduce((sum, s) => sum + s.sleepDurationHours, 0);
  const exerciseMinutes = exercises.reduce((sum, e) => sum + e.durationMinutes, 0) + 
                          sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const caloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0) +
                         sessions.reduce((sum, s) => sum + (s.durationMinutes || 0) * 8, 0); // Approx 8 kcal/min for gym
  const totalVolume = exercises.reduce((sum, e) => sum + (e.volume || 0), 0) +
                      sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);

  const stats = await DailyHealthStats.findOneAndUpdate(
    { userId, date },
    {
      caloriesConsumed,
      proteinConsumed,
      waterConsumed,
      sleepHours,
      exerciseMinutes,
      caloriesBurned,
      totalVolume,
    },
    { new: true, upsert: true }
  );

  // Update Health Score
  const targets = await NutritionTargets.findOne({ userId });
  if (targets) {
    const scoreData = calculateDailyHealthScore(stats, targets);
    await DailyHealthScore.findOneAndUpdate(
      { userId, date },
      { ...scoreData },
      { new: true, upsert: true }
    );
    stats.healthScore = scoreData.score;
    await stats.save();
  }

  return stats;
};

export const getDailyStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { date } = req.query;
    const stats = await updateDailyStats(userId, date as string);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Meal Logs ---

export const addMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const meal = new MealLog({ ...req.body, userId });
    await meal.save();
    
    const date = new Date(meal.timestamp).toISOString().split('T')[0];
    await updateDailyStats(userId, date);
    
    res.status(201).json(meal);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeals = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { date } = req.query;
    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);

    const meals = await MealLog.find({ userId, timestamp: { $gte: start, $lte: end } });
    res.status(200).json(meals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Water Logs ---

export const addWater = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const water = new WaterLog({ ...req.body, userId });
    await water.save();

    const date = new Date(water.timestamp).toISOString().split('T')[0];
    await updateDailyStats(userId, date);

    res.status(201).json(water);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Sleep Logs ---

export const logSleep = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { sleepStartTime, sleepEndTime, sleepQualityScore } = req.body;
    
    const start = new Date(sleepStartTime);
    const end = new Date(sleepEndTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const sleep = new SleepLog({
      userId,
      sleepStartTime: start,
      sleepEndTime: end,
      sleepDurationHours: durationHours,
      sleepQualityScore,
    });
    await sleep.save();

    const date = end.toISOString().split('T')[0];
    await updateDailyStats(userId, date);

    res.status(201).json(sleep);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Exercise Logs ---

export const logExercise = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { sets, reps, weight } = req.body;
    const volume = (sets || 0) * (reps || 0) * (weight || 0);
    
    const exercise = new ExerciseLog({ 
      ...req.body, 
      userId,
      volume 
    });
    await exercise.save();

    const date = new Date(exercise.timestamp).toISOString().split('T')[0];
    await updateDailyStats(userId, date);

    res.status(201).json(exercise);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Exercise Library ---

export const getExercises = async (req: Request, res: Response) => {
  try {
    const { search, type, difficulty } = req.query;
    let query: any = {};
    if (search) query.exerciseName = { $regex: search, $options: 'i' };
    if (type) query.exerciseType = type;
    if (difficulty) query.difficultyLevel = difficulty;

    const exercises = await ExerciseLibrary.find(query);
    res.status(200).json(exercises);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Habit Logs ---

export const updateHabits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { date } = req.body;
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const habit = await HabitLog.findOneAndUpdate(
      { userId, timestamp: { $gte: start, $lte: end } },
      { ...req.body, userId, timestamp: start },
      { new: true, upsert: true }
    );
    res.status(200).json(habit);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { date } = req.query;
    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);

    const habit = await HabitLog.findOne({ userId, timestamp: { $gte: start, $lte: end } });
    res.status(200).json(habit || { walkCompleted: false, hydrationCompleted: false, sleepBeforeMidnight: false, meditationCompleted: false, stretchingCompleted: false });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Analytics ---

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { days = 7 } = req.query;
    const stats = await DailyHealthStats.find({ userId })
      .sort({ date: -1 })
      .limit(Number(days));
    res.status(200).json(stats.reverse());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Workout Sessions ---

export const startWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    // Check if there's already an active workout
    let activeWorkout = await WorkoutSession.findOne({ userId, status: 'active' });
    if (activeWorkout) {
      return res.status(200).json(activeWorkout);
    }

    const workout = new WorkoutSession({
      userId,
      title: req.body.title || 'New Workout',
      startTime: new Date(),
      status: 'active',
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const workout = await WorkoutSession.findOne({ userId, status: 'active' });
    res.status(200).json(workout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { workoutId } = req.params;
    const workout = await WorkoutSession.findOneAndUpdate(
      { _id: workoutId, userId },
      { ...req.body },
      { new: true }
    );
    res.status(200).json(workout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const finishWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { workoutId } = req.params;
    const workout = await WorkoutSession.findOne({ _id: workoutId, userId });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const endTime = new Date();
    const startTime = new Date(workout.startTime);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Calculate total volume and 1RMs
    let totalVolume = 0;
    workout.exercises.forEach((ex) => {
      let maxOneRM = 0;
      ex.sets.forEach((set) => {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          const volume = set.weight * set.reps;
          totalVolume += volume;
          
          // Brzycki Formula
          const currentOneRM = set.weight * (36 / (37 - Math.min(set.reps, 36)));
          if (currentOneRM > maxOneRM) maxOneRM = currentOneRM;
        }
      });
      ex.oneRM = Math.round(maxOneRM * 10) / 10;
    });

    workout.endTime = endTime;
    workout.durationMinutes = durationMinutes;
    workout.totalVolume = totalVolume;
    workout.status = 'completed';
    await workout.save();

    // Update Daily Stats
    const date = endTime.toISOString().split('T')[0];
    await updateDailyStats(userId, date);

    res.status(200).json(workout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { limit = 10 } = req.query;
    const workouts = await WorkoutSession.find({ userId, status: 'completed' })
      .sort({ startTime: -1 })
      .limit(Number(limit));
    res.status(200).json(workouts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPreviousWorkoutData = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const lastWorkout = await WorkoutSession.findOne({ userId, status: 'completed' })
      .sort({ endTime: -1 });
    res.status(200).json(lastWorkout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
