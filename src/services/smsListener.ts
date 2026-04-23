import { PermissionsAndroid, Platform } from 'react-native';
// @ts-ignore
import SmsAndroid from 'react-native-get-sms-android';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { parseSMS } from '../utils/smsParser';
import { useFinanceStore } from '../stores/financeStore';

export const BACKGROUND_SMS_SYNC_TASK = 'background-sms-sync';



export const requestSMSPermission = async () => {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission',
        message: 'Life Assistant needs access to your SMS to automatically track bank transactions.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    return false;
  }
};

export const syncRecentSMS = async () => {
  if (!SmsAndroid || typeof SmsAndroid.list !== 'function') {
    return;
  }
  const hasPermission = await requestSMSPermission();
  if (!hasPermission) return;

  const filter = {
    box: 'inbox',
    maxCount: 20, // Check last 20 messages
  };

  SmsAndroid.list(
    JSON.stringify(filter),
    (fail: string) => {
      // SMS read failed silently
    },
    async (count: number, smsList: string) => {
      const messages = JSON.parse(smsList);
      const { createTransaction, transactions } = useFinanceStore.getState();

      for (const msg of messages) {
        const parsed = parseSMS(msg.body);
        
        if (parsed) {
          // Check if we already have this transaction (simple check by raw SMS)
          const exists = transactions.some(t => t.rawSms === msg.body);
          
          if (!exists) {
            await createTransaction({
              amount: parsed.amount,
              type: parsed.type,
              category: parsed.category,
              merchant: parsed.merchant,
              timestamp: new Date(msg.date).toISOString(),
              source: 'sms',
              rawSms: msg.body,
            });
          }
        }
      }
    }
  );
};

// V2: Define Background Task
TaskManager.defineTask(BACKGROUND_SMS_SYNC_TASK, async () => {
  try {
    await syncRecentSMS();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// V2: Register Background Task
export const registerBackgroundSMSStore = async () => {
  if (Platform.OS !== 'android') return;
  
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SMS_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false, // Continue after reboot
      startOnBoot: true,
    });
  } catch (err) {
    // Task already registered or failed
  }
};


