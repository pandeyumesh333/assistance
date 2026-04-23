import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthProfile extends Document {
  userId: mongoose.Types.ObjectId;
  heightCm: number;
  weightKg: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  fitnessGoal: 'weight_loss' | 'maintenance' | 'muscle_gain';
  bmi: number;
  createdAt: Date;
  updatedAt: Date;
}

const healthProfileSchema = new Schema<IHealthProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
      required: true,
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'maintenance', 'muscle_gain'],
      required: true,
    },
    bmi: { type: Number, required: true },
  },
  { timestamps: true }
);

export const HealthProfile = mongoose.model<IHealthProfile>('HealthProfile', healthProfileSchema);
