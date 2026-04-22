import { PermissionsAndroid, Platform } from 'react-native';
// @ts-ignore
import SmsAndroid from 'react-native-get-sms-android';
import { parseSMS } from '../utils/smsParser';
import { useFinanceStore } from '../stores/financeStore';

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
    console.warn(err);
    return false;
  }
};

export const syncRecentSMS = async () => {
  const hasPermission = await requestSMSPermission();
  if (!hasPermission) return;

  const filter = {
    box: 'inbox',
    maxCount: 20, // Check last 20 messages
  };

  SmsAndroid.list(
    JSON.stringify(filter),
    (fail: string) => {
      console.log('Failed with error: ' + fail);
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
            console.log('Automatically added transaction from SMS:', parsed.merchant);
          }
        }
      }
    }
  );
};
