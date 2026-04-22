import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BalanceSummary, CreateTransactionInput } from '../types';
import { transactionAPI, accountAPI } from '../services/api';

interface FinanceState {
  transactions: Transaction[];
  balance: BalanceSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchTransactions: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  createTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateOpeningBalance: (amount: number) => Promise<void>;
  loadCached: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  balance: null,
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await transactionAPI.getAll({ limit: 50 });
      set({ transactions: data.transactions, isLoading: false });
      await AsyncStorage.setItem('cached_transactions', JSON.stringify(data.transactions));
    } catch (error: any) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
      await get().loadCached();
    }
  },

  fetchBalance: async () => {
    try {
      const { data } = await transactionAPI.getBalance();
      set({ balance: data });
    } catch (error: any) {
      set({ error: 'Failed to fetch balance' });
    }
  },

  createTransaction: async (input: CreateTransactionInput) => {
    try {
      set({ error: null });
      const { data } = await transactionAPI.create(input);
      set({ transactions: [data.transaction, ...get().transactions] });
      // Refresh balance after new transaction
      await get().fetchBalance();
    } catch (error: any) {
      set({ error: 'Failed to create transaction' });
      throw error;
    }
  },

  updateOpeningBalance: async (amount: number) => {
    try {
      set({ error: null });
      await accountAPI.updateBalance(amount);
      await get().fetchBalance();
    } catch (error: any) {
      set({ error: 'Failed to update balance' });
      throw error;
    }
  },

  loadCached: async () => {
    try {
      const cached = await AsyncStorage.getItem('cached_transactions');
      if (cached) {
        set({ transactions: JSON.parse(cached), isLoading: false });
      }
    } catch (error) {}
  },
}));
