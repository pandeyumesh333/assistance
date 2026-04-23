import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyHealthStats extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  steps: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  proteinConsumed: number;
  waterConsumed: number;
  sleepHours: number;
  exerciseMinutes: number;
  healthScore: number;
  totalVolume: number;
  createdAt: Date;
  updatedAt: Date;
}

const dailyHealthStatsSchema = new Schema<IDailyHealthStats>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    steps: { type: Number, default: 0 },
    caloriesConsumed: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    proteinConsumed: { type: Number, default: 0 },
    waterConsumed: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 0 },
    exerciseMinutes: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for efficient searching by user and date
dailyHealthStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyHealthStats = mongoose.model<IDailyHealthStats>('DailyHealthStats', dailyHealthStatsSchema);
