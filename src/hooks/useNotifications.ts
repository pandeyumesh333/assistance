import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';


export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        authAPI.updatePushToken(token).catch(() => {});
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const { data } = notification.request.content;
        const isAlarm = notification.request.content.title?.includes('ALARM');
        
        if (data?.type === 'task' && isAlarm) {
          try {
            console.log('Playing Game of Thrones Alarm...');
            const { sound } = await Audio.Sound.createAsync(
              require('../../assets/sounds/alarm.mp3'),
              { shouldPlay: true, volume: 1.0, isLooping: true }
            );
            // Ring for 30 seconds
            setTimeout(async () => {
              await sound.stopAsync();
              await sound.unloadAsync();
            }, 30000);
          } catch (e) {
            console.error('Failed to play alarm sound', e);
          }
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Notification tapped
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  return { expoPushToken };
};

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices, not web
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    let tokenData;
    try {
      tokenData = await Notifications.getExpoPushTokenAsync();
    } catch (e) {
      return null;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    return tokenData.data;
  } catch (error) {
    return null;
  }
}

