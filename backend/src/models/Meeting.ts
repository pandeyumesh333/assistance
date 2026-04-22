import mongoose, { Document, Schema } from 'mongoose';

export interface IMeeting extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  time: Date;
  location?: string;
  notes?: string;
  reminderTime?: Date;
  createdAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    time: { type: Date, required: true },
    location: { type: String },
    notes: { type: String },
    reminderTime: { type: Date },
  },
  { timestamps: true }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);
