export interface User {
  _id: string;
  email: string;
  name: string;
  pushToken: string | null;
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: string;
}

export interface Meeting {
  _id: string;
  userId: string;
  title: string;
  time: string;
  location: string;
  notes: string;
  reminderTime: string | null;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  merchant: string;
  source: 'manual' | 'sms';
  timestamp: string;
}

export interface Account {
  _id: string;
  userId: string;
  openingBalance: number;
  lastUpdated: string;
}

export interface BalanceSummary {
  openingBalance: number;
  totalCredits: number;
  totalDebits: number;
  currentBalance: number;
  lastUpdated: string;
}

export interface DailySummary {
  greeting: string;
  pendingTasks: number;
  todayMeetings: number;
  yesterdayExpenses: number;
  currentBalance: number;
  summaryText: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: 'task' | 'meeting' | 'expense' | 'summary';
  title: string;
  body: string;
  read: boolean;
  sentAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface CreateMeetingInput {
  title: string;
  time: string;
  location?: string;
  notes?: string;
  reminderTime?: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  merchant?: string;
  source?: 'manual' | 'sms';
  timestamp?: string;
}
