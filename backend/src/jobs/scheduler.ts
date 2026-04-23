import cron from 'node-cron';
import { User, IUser } from '../models/User';
import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { sendPushNotification } from '../services/notificationService';
import {
  generateDailyMorningSummary,
  generateDailyEveningSummary,
} from '../services/summaryService';
import { initHealthReminders } from './health/reminderJobs';

export const initScheduler = (): void => {
  initHealthReminders();
  // Check for task and meeting reminders every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 1. Check Meetings
      const upcomingMeetings = await Meeting.find({
        reminderTime: {
          $lte: now,
          $gt: new Date(now.getTime() - 60000), // Within last minute
        },
      }).populate('userId');

      for (const meeting of upcomingMeetings) {
        const user = meeting.userId as unknown as IUser;
        if (user && user.notificationsEnabled) {
          await sendPushNotification(
            user._id.toString(),
            user.pushToken,
            'Meeting Reminder',
            `"${meeting.title}" is starting soon at ${new Date(meeting.time).toLocaleTimeString()}`,
            'reminder'
          );
        }
      }

      // 2. Check Tasks (Due in exactly 1 hour)
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const upcomingTasks = await Task.find({
        completed: false,
        dueDate: {
          $lte: oneHourFromNow,
          $gt: new Date(oneHourFromNow.getTime() - 60000),
        },
      }).populate('userId');

      for (const task of upcomingTasks) {
        const user = task.userId as unknown as IUser;
        if (user && user.notificationsEnabled) {
          await sendPushNotification(
            user._id.toString(),
            user.pushToken,
            'Task Due Soon',
            `"${task.title}" is due in 1 hour.`,
            'reminder'
          );
        }
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });

  // Morning Summary at 8:00 AM Daily
  cron.schedule('0 8 * * *', async () => {
    try {
      const users = await User.find({ notificationsEnabled: true });
      for (const user of users) {
        await generateDailyMorningSummary(user);
      }
    } catch (error) {
      console.error('Error in morning summary scheduler:', error);
    }
  });

  // Evening Expense Summary at 8:00 PM Daily
  cron.schedule('0 20 * * *', async () => {
    try {
      const users = await User.find({ notificationsEnabled: true });
      for (const user of users) {
        await generateDailyEveningSummary(user);
      }
    } catch (error) {
      console.error('Error in evening summary scheduler:', error);
    }
  });

  console.log('Cron scheduler initialized');
};
