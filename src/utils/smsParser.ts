import { Platform } from 'react-native';

interface ParsedTransaction {
  amount: number;
  type: 'credit' | 'debit';
  merchant: string;
  timestamp: Date;
}

// Common Indian bank SMS patterns
const SMS_PATTERNS = [
  // Debit patterns
  {
    regex: /(?:debited|spent|paid|purchased|withdrawn|deducted).*?(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
    type: 'debit' as const,
  },
  {
    regex: /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*).*?(?:debited|spent|withdrawn|deducted)/i,
    type: 'debit' as const,
  },
  // Credit patterns
  {
    regex: /(?:credited|received|deposited|refund).*?(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*)/i,
    type: 'credit' as const,
  },
  {
    regex: /(?:Rs\.?|INR|₹)\s*([\d,]+\.?\d*).*?(?:credited|received|deposited|refund)/i,
    type: 'credit' as const,
  },
];

// Merchant extraction patterns
const MERCHANT_PATTERNS = [
  /(?:at|to|from|towards|for)\s+([A-Za-z0-9\s&]+?)(?:\s+on|\s+ref|\s+UPI|\.|\s*$)/i,
  /(?:UPI-|IMPS-|NEFT-)\s*([A-Za-z0-9\s&]+?)(?:\s+on|\s+ref|\.|\s*$)/i,
  /(?:VPA|payee)\s*[:=]\s*([A-Za-z0-9@.\s]+)/i,
];

/**
 * Parse a bank SMS message to extract transaction details
 * Only works on Android platform
 */
export const parseBankSMS = (smsBody: string): ParsedTransaction | null => {
  if (Platform.OS !== 'android') return null;

  // Try each pattern to find amount and type
  for (const pattern of SMS_PATTERNS) {
    const match = smsBody.match(pattern.regex);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (isNaN(amount) || amount <= 0) continue;

      // Extract merchant
      let merchant = '';
      for (const merchantPattern of MERCHANT_PATTERNS) {
        const merchantMatch = smsBody.match(merchantPattern);
        if (merchantMatch && merchantMatch[1]) {
          merchant = merchantMatch[1].trim();
          break;
        }
      }

      return {
        amount,
        type: pattern.type,
        merchant: merchant || 'Unknown',
        timestamp: new Date(),
      };
    }
  }

  return null;
};

/**
 * Check if an SMS is from a known bank sender
 */
export const isBankSMS = (sender: string): boolean => {
  const bankPrefixes = [
    'HDFCBK', 'SBIINB', 'ICICIB', 'AXISBK', 'KOTAKB',
    'PNBSMS', 'BOIIND', 'CANBNK', 'UNIONB', 'INDBNK',
    'PAYTM', 'GPAY', 'PHONEPE', 'AMAZON',
    'AD-', 'AX-', 'BZ-', 'VM-', 'DM-', 'BW-',
  ];

  const upperSender = sender.toUpperCase();
  return bankPrefixes.some((prefix) => upperSender.includes(prefix));
};

/**
 * Check if SMS parsing is available on current platform
 */
export const isSMSAvailable = (): boolean => {
  return Platform.OS === 'android';
};
