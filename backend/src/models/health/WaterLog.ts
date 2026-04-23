import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterLog extends Document {
  userId: mongoose.Types.ObjectId;
  quantityMl: number;
  timestamp: Date;
}

const waterLogSchema = new Schema<IWaterLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quantityMl: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const WaterLog = mongoose.model<IWaterLog>('WaterLog', waterLogSchema);
