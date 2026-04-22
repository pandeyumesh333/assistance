import express from 'express';
import { updateOpeningBalance } from '../controllers/accountController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.put('/opening-balance', protect, updateOpeningBalance);

export default router;
