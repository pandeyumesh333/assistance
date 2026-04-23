import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitLog extends Document {
  userId: mongoose.Types.ObjectId;
  walkCompleted: boolean;
  hydrationCompleted: boolean;
  sleepBeforeMidnight: boolean;
  meditationCompleted: boolean;
  stretchingCompleted: boolean;
  timestamp: Date;
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    walkCompleted: { type: Boolean, default: false },
    hydrationCompleted: { type: Boolean, default: false },
    sleepBeforeMidnight: { type: Boolean, default: false },
    meditationCompleted: { type: Boolean, default: false },
    stretchingCompleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const HabitLog = mongoose.model<IHabitLog>('HabitLog', habitLogSchema);
