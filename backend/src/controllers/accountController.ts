import { Request, Response } from 'express';
import { Account } from '../models/Account';

export const updateOpeningBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;

    let account = await Account.findOne({ userId: req.userId });

    if (account) {
      account.openingBalance = amount;
      account.lastUpdated = new Date();
      await account.save();
    } else {
      account = await Account.create({
        userId: req.userId,
        openingBalance: amount,
      });
    }

    res.json(account);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
