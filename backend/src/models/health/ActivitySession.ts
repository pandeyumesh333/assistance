import mongoose, { Document, Schema } from 'mongoose';

export interface ILocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude?: number;
  speed?: number;
}

export interface IActivitySession extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'walk' | 'run' | 'cycle' | 'other';
  title: string;
  startTime: Date;
  endTime?: Date;
  durationSeconds: number;
  distanceKm: number;
  steps: number;
  caloriesBurned: number;
  route: ILocationPoint[];
  status: 'active' | 'completed' | 'paused';
}

const locationPointSchema = new Schema<ILocationPoint>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  altitude: { type: Number },
  speed: { type: Number },
});

const activitySessionSchema = new Schema<IActivitySession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['walk', 'run', 'cycle', 'other'],
      default: 'walk',
    },
    title: { type: String, default: 'New Activity' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    distanceKm: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    route: [locationPointSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const ActivitySession = mongoose.model<IActivitySession>('ActivitySession', activitySessionSchema);
