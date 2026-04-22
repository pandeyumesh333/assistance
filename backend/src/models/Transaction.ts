import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  merchant?: string;
  timestamp: Date;
  source: 'manual' | 'sms';
  rawSms?: string;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    category: { type: String, required: true, default: 'Other' },
    merchant: { type: String },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, enum: ['manual', 'sms'], default: 'manual' },
    rawSms: { type: String },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
