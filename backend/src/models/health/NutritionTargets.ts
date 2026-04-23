import mongoose, { Document, Schema } from 'mongoose';

export interface INutritionTargets extends Document {
  userId: mongoose.Types.ObjectId;
  dailyCaloriesTarget: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatsTargetGrams: number;
  hydrationTargetMl: number;
  stepsTarget: number;
  sleepTargetHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const nutritionTargetsSchema = new Schema<INutritionTargets>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyCaloriesTarget: { type: Number, required: true },
    proteinTargetGrams: { type: Number, required: true },
    carbsTargetGrams: { type: Number, required: true },
    fatsTargetGrams: { type: Number, required: true },
    hydrationTargetMl: { type: Number, required: true },
    stepsTarget: { type: Number, required: true },
    sleepTargetHours: { type: Number, required: true },
  },
  { timestamps: true }
);

export const NutritionTargets = mongoose.model<INutritionTargets>('NutritionTargets', nutritionTargetsSchema);
