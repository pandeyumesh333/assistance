import { Expo } from 'expo-server-sdk';
import { Notification } from '../models/Notification';

const expo = new Expo();

export const sendPushNotification = async (
  userId: string,
  pushToken: string | undefined,
  title: string,
  body: string,
  type: 'reminder' | 'summary' | 'alert' = 'alert'
): Promise<void> => {
  try {
    // 1. Save to database
    await Notification.create({
      userId,
      title,
      body,
      type,
    });

    // 2. Send push notification if token exists and is valid
    if (pushToken && Expo.isExpoPushToken(pushToken)) {
      const messages = [
        {
          to: pushToken,
          sound: 'default' as const,
          title,
          body,
          data: { type },
        },
      ];

      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
};
