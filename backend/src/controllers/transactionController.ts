import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({
      timestamp: -1,
    });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, type, category, merchant, timestamp, source, rawSms } =
      req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      amount,
      type,
      category,
      merchant,
      timestamp: timestamp || new Date(),
      source,
      rawSms,
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get opening balance
    const account = await Account.findOne({ userId: req.userId });
    const openingBalance = account ? account.openingBalance : 0;

    // 2. Aggregate transactions
    const aggregation = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalCredits = 0;
    let totalDebits = 0;

    aggregation.forEach((agg) => {
      if (agg._id === 'credit') totalCredits = agg.total;
      if (agg._id === 'debit') totalDebits = agg.total;
    });

    const currentBalance = openingBalance + totalCredits - totalDebits;

    res.json({
      openingBalance,
      totalCredits,
      totalDebits,
      currentBalance,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
