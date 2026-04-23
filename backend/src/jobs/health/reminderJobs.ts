import cron from 'node-cron';
import { User } from '../../models/User';
import { DailyHealthStats } from '../../models/health/DailyHealthStats';
import { NutritionTargets } from '../../models/health/NutritionTargets';
import { sendPushNotification } from '../../services/notificationService';

export const initHealthReminders = () => {
  // Hydration reminder every 2 hours between 8 AM and 10 PM
  cron.schedule('0 8-22/2 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const users = await User.find({ notificationsEnabled: true });

      for (const user of users) {
        const stats = await DailyHealthStats.findOne({ userId: user._id, date: today });
        const targets = await NutritionTargets.findOne({ userId: user._id });

        if (targets && (!stats || stats.waterConsumed < targets.hydrationTargetMl)) {
          await sendPushNotification(
            user._id.toString(),
            user.pushToken,
            'Stay Hydrated! 💧',
            `You haven't reached your hydration goal yet. Time for a glass of water!`,
            'health'
          );
        }
      }
    } catch (error) {
      console.error('Error in hydration reminder job:', error);
    }
  });

  // Workout reminder at 5 PM if not completed
  cron.schedule('0 17 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const users = await User.find({ notificationsEnabled: true });

      for (const user of users) {
        const stats = await DailyHealthStats.findOne({ userId: user._id, date: today });
        if (!stats || stats.exerciseMinutes === 0) {
          await sendPushNotification(
            user._id.toString(),
            user.pushToken,
            'Time to Move! 🏃‍♂️',
            `Don't forget to get some exercise today to keep your streak alive!`,
            'health'
          );
        }
      }
    } catch (error) {
      console.error('Error in workout reminder job:', error);
    }
  });

  // Sleep reminder at 10:30 PM
  cron.schedule('30 22 * * *', async () => {
    try {
      const users = await User.find({ notificationsEnabled: true });
      for (const user of users) {
        await sendPushNotification(
          user._id.toString(),
          user.pushToken,
          'Prepare for Sleep 😴',
          `It's almost bedtime. Wind down and prepare for a restful sleep to meet your goal!`,
          'health'
        );
      }
    } catch (error) {
      console.error('Error in sleep reminder job:', error);
    }
  });
};
