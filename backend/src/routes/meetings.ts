import express from 'express';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getMeetings).post(protect, createMeeting);
router.route('/:id').put(protect, updateMeeting).delete(protect, deleteMeeting);

export default router;
