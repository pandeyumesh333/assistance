import express from 'express';
import {
  signup,
  login,
  getMe,
  updatePushToken,
  updateProfile,
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/push-token', protect, updatePushToken);
router.put('/profile', protect, updateProfile);

export default router;
