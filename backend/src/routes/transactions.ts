import express from 'express';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getBalance,
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.get('/balance', protect, getBalance); 
router.delete('/:id', protect, deleteTransaction);

export default router;
