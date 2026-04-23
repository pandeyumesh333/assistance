import mongoose, { Document, Schema } from 'mongoose';

export interface IExerciseLog extends Document {
  userId: mongoose.Types.ObjectId;
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  exerciseType: 'gym' | 'home' | 'yoga' | 'other';
  sets?: number;
  reps?: number;
  weight?: number;
  volume?: number;
  completed: boolean;
  timestamp: Date;
}

const exerciseLogSchema = new Schema<IExerciseLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseName: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    exerciseType: {
      type: String,
      enum: ['gym', 'home', 'yoga', 'other'],
      required: true,
    },
    sets: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    completed: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ExerciseLog = mongoose.model<IExerciseLog>('ExerciseLog', exerciseLogSchema);
