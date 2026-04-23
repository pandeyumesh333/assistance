import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyHealthScore extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  hydrationScore: number;
  sleepScore: number;
  nutritionScore: number;
  exerciseScore: number;
}

const dailyHealthScoreSchema = new Schema<IDailyHealthScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    hydrationScore: { type: Number, required: true, min: 0, max: 100 },
    sleepScore: { type: Number, required: true, min: 0, max: 100 },
    nutritionScore: { type: Number, required: true, min: 0, max: 100 },
    exerciseScore: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

dailyHealthScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyHealthScore = mongoose.model<IDailyHealthScore>('DailyHealthScore', dailyHealthScoreSchema);
