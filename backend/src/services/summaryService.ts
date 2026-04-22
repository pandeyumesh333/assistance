import { Task } from '../models/Task';
import { Meeting } from '../models/Meeting';
import { Transaction } from '../models/Transaction';
import { sendPushNotification } from './notificationService';
import { IUser } from '../models/User';

export const generateDailyMorningSummary = async (user: IUser): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const tasks = await Task.countDocuments({
      userId: user._id,
      completed: false,
      dueDate: { $lte: todayEnd },
    });

    const meetings = await Meeting.find({
      userId: user._id,
      time: { $gte: todayStart, $lte: todayEnd },
    }).sort({ time: 1 });

    let body = `Good morning, ${user.name}! `;

    if (meetings.length > 0) {
      body += `You have ${meetings.length} meeting(s) today. First is at ${new Date(
        meetings[0].time
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. `;
    } else {
      body += `Your calendar is clear today! `;
    }

    if (tasks > 0) {
      body += `You have ${tasks} pending task(s) due.`;
    }

    await sendPushNotification(
      user._id.toString(),
      user.pushToken,
      'Daily Summary',
      body,
      'summary'
    );
  } catch (error) {
    console.error('Error generating morning summary:', error);
  }
};

export const generateDailyEveningSummary = async (user: IUser): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const expenses = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: 'debit',
          timestamp: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = expenses.length > 0 ? expenses[0].total : 0;

    let body = `Good evening, ${user.name}. `;
    if (totalSpent > 0) {
      body += `You spent ₹${totalSpent.toFixed(2)} today.`;
    } else {
      body += `You didn't spend anything today. Great job saving!`;
    }

    await sendPushNotification(
      user._id.toString(),
      user.pushToken,
      'Daily Expense Recap',
      body,
      'summary'
    );
  } catch (error) {
    console.error('Error generating evening summary:', error);
  }
};
