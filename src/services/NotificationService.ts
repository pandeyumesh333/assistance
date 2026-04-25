import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Task } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async scheduleTaskReminder(task: Task) {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    const reminderTime = new Date(dueDate.getTime() - (task.reminderOffset || 0) * 60000);

    // If reminder time is in the past, don't schedule
    if (reminderTime.getTime() <= Date.now()) return null;

    // Cancel existing notifications for this task if any
    await this.cancelTaskReminder(task._id);

    const type = task.reminderType || 'notification';
    const isAlarm = type === 'alarm' || type === 'both';
    
    // Create an Alarm channel for Android
    if (Platform.OS === 'android' && isAlarm) {

      await Notifications.setNotificationChannelAsync('alarm-channel', {
        name: 'Task Alarms',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000],
        lightColor: '#EF4444',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
      });
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: isAlarm ? `⏰ ALARM: ${task.title}` : `🔔 Task Reminder: ${task.title}`,
        body: task.description || (isAlarm ? 'Wake up! Task is due!' : 'You have a task due soon!'),
        data: { taskId: task._id, type: 'task' },
        sound: true, 
        vibrate: isAlarm ? [0, 1000, 500, 1000, 500, 1000, 500, 1000] : [0, 250, 250, 250],
        priority: isAlarm ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
        // For some versions, channelId is at the top level of content
        // @ts-ignore
        channelId: isAlarm ? 'alarm-channel' : 'default',
        categoryIdentifier: isAlarm ? 'alarm' : undefined,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });

    return identifier;
  },

  async cancelTaskReminder(taskId: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const taskNotifications = scheduled.filter(
      (n) => n.content.data?.taskId === taskId
    );
    
    for (const n of taskNotifications) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  },

  async playAlarmSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      return sound;
    } catch (e) {

      return null;
    }
  }
};
