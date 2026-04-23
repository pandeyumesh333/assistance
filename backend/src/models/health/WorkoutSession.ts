import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutSet {
  type: 'warmup' | 'normal' | 'drop' | 'failure';
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  completedAt?: Date;
}

export interface IWorkoutExercise {
  exerciseId: mongoose.Types.ObjectId;
  exerciseName: string;
  sets: IWorkoutSet[];
  notes?: string;
  oneRM?: number;
}

export interface IWorkoutSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  exercises: IWorkoutExercise[];
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  totalVolume: number;
  status: 'active' | 'completed' | 'cancelled';
}

const workoutSetSchema = new Schema<IWorkoutSet>({
  type: {
    type: String,
    enum: ['warmup', 'normal', 'drop', 'failure'],
    default: 'normal',
  },
  weight: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  rpe: { type: Number },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const workoutExerciseSchema = new Schema<IWorkoutExercise>({
  exerciseId: { type: Schema.Types.ObjectId, ref: 'ExerciseLibrary', required: true },
  exerciseName: { type: String, required: true },
  sets: [workoutSetSchema],
  notes: { type: String },
  oneRM: { type: Number, default: 0 },
});

const workoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Workout' },
    exercises: [workoutExerciseSchema],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    totalVolume: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', workoutSessionSchema);
