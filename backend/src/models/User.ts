import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  pushToken?: string;
  notificationsEnabled: boolean;
  xp: number;
  level: number;
  streak: number;
  totalTasksCompleted: number;
  lastTaskCompletedDate?: Date;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    pushToken: { type: String },
    notificationsEnabled: { type: Boolean, default: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    lastTaskCompletedDate: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
