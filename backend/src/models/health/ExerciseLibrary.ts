import mongoose, { Document, Schema } from 'mongoose';

export interface IExerciseLibrary extends Document {
  exerciseName: string;
  muscleGroup: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  exerciseType: 'gym' | 'home' | 'yoga';
  instructions: string[];
  recommendedDuration: number; // minutes
  videoUrl?: string;
}

const exerciseLibrarySchema = new Schema<IExerciseLibrary>(
  {
    exerciseName: { type: String, required: true, unique: true },
    muscleGroup: { type: String, required: true },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    exerciseType: {
      type: String,
      enum: ['gym', 'home', 'yoga'],
      required: true,
    },
    instructions: [{ type: String }],
    recommendedDuration: { type: Number, required: true },
    videoUrl: { type: String },
  },
  { timestamps: true }
);

export const ExerciseLibrary = mongoose.model<IExerciseLibrary>('ExerciseLibrary', exerciseLibrarySchema);
