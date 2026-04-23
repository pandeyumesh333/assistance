import mongoose, { Document, Schema } from 'mongoose';

export interface ISleepLog extends Document {
  userId: mongoose.Types.ObjectId;
  sleepStartTime: Date;
  sleepEndTime: Date;
  sleepDurationHours: number;
  sleepQualityScore: number; // 1-10
}

const sleepLogSchema = new Schema<ISleepLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sleepStartTime: { type: Date, required: true },
    sleepEndTime: { type: Date, required: true },
    sleepDurationHours: { type: Number, required: true },
    sleepQualityScore: { type: Number, min: 1, max: 10, required: true },
  },
  { timestamps: true }
);

export const SleepLog = mongoose.model<ISleepLog>('SleepLog', sleepLogSchema);
