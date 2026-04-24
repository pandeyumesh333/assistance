import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  audioNoteUrl?: string;
  reminderOffset?: number; // minutes before
  reminderType?: 'notification' | 'alarm' | 'both';
  xpReward: number;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    audioNoteUrl: { type: String },
    reminderOffset: { type: Number, default: 0 },
    reminderType: {
      type: String,
      enum: ['notification', 'alarm', 'both'],
      default: 'notification',
    },
    xpReward: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
