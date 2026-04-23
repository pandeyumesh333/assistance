import { IHealthProfile } from '../../models/health/HealthProfile';
import { INutritionTargets } from '../../models/health/NutritionTargets';

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export const calculateNutritionTargets = (profile: IHealthProfile): Partial<INutritionTargets> => {
  const { weightKg, heightCm, age, gender, activityLevel, fitnessGoal } = profile;

  // BMR calculation using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity Multipliers
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const tdee = bmr * multipliers[activityLevel];

  // Adjust for Goal
  let dailyCaloriesTarget: number;
  if (fitnessGoal === 'weight_loss') {
    dailyCaloriesTarget = tdee - 500; // 500 calorie deficit
  } else if (fitnessGoal === 'muscle_gain') {
    dailyCaloriesTarget = tdee + 300; // 300 calorie surplus
  } else {
    dailyCaloriesTarget = tdee;
  }

  // Macro Distribution
  // Protein: 1.2g to 2.2g per kg (using 1.8g as a balanced default for active individuals)
  const proteinTargetGrams = Math.round(weightKg * 1.8);
  
  // Fats: 25% of calories
  const fatsTargetGrams = Math.round((dailyCaloriesTarget * 0.25) / 9);
  
  // Carbs: Remaining calories
  const carbsTargetGrams = Math.round((dailyCaloriesTarget - (proteinTargetGrams * 4) - (fatsTargetGrams * 9)) / 4);

  // Hydration: 35ml per kg body weight
  const hydrationTargetMl = Math.round(weightKg * 35);

  return {
    dailyCaloriesTarget: Math.round(dailyCaloriesTarget),
    proteinTargetGrams,
    carbsTargetGrams,
    fatsTargetGrams,
    hydrationTargetMl,
    stepsTarget: 10000, // Default baseline
    sleepTargetHours: 8, // Default baseline
  };
};

export const calculateDailyHealthScore = (
  stats: any,
  targets: INutritionTargets
): {
  score: number;
  hydrationScore: number;
  sleepScore: number;
  nutritionScore: number;
  exerciseScore: number;
} => {
  const hydrationScore = Math.min(100, Math.round((stats.waterConsumed / targets.hydrationTargetMl) * 100));
  const sleepScore = Math.min(100, Math.round((stats.sleepHours / targets.sleepTargetHours) * 100));
  
  // Nutrition Score: Blend of calories and protein
  const calRatio = stats.caloriesConsumed / targets.dailyCaloriesTarget;
  const calScore = calRatio > 1 ? Math.max(0, 100 - (calRatio - 1) * 100) : calRatio * 100;
  const protScore = Math.min(100, (stats.proteinConsumed / targets.proteinTargetGrams) * 100);
  const nutritionScore = Math.round((calScore + protScore) / 2);

  // Exercise Score: Based on 30 mins goal
  const exerciseScore = Math.min(100, Math.round((stats.exerciseMinutes / 30) * 100));

  const totalScore = Math.round((hydrationScore + sleepScore + nutritionScore + exerciseScore) / 4);

  return {
    score: totalScore,
    hydrationScore,
    sleepScore,
    nutritionScore,
    exerciseScore,
  };
};
