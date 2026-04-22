import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, BalanceSummary, CreateTransactionInput } from '../types';
import { transactionAPI, accountAPI } from '../services/api';

interface FinanceState {
  transactions: Transaction[];
  balance: BalanceSummary | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  lastFetched: number | null;

  fetchTransactions: (force?: boolean) => Promise<void>;
  fetchMoreTransactions: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  createTransaction: (input: CreateTransactionInput) => Promise<void>;
  updateOpeningBalance: (amount: number) => Promise<void>;
  loadCached: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  balance: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  hasMore: true,
  lastFetched: null,

  fetchTransactions: async (force = false) => {
    const { lastFetched, isLoading } = get();
    const now = Date.now();

    // Cache logic: 1 minute (60,000 ms)
    if (!force && lastFetched && now - lastFetched < 60000) {
      return;
    }

    if (isLoading) return;

    try {
      set({ isLoading: true, error: null, page: 1, hasMore: true });
      const { data } = await transactionAPI.getAll({ page: 1, limit: 20 });
      
      const transactions = Array.isArray(data) ? data : (data.transactions || []);
      const totalPages = data.pages || 1;

      set({
        transactions,
        isLoading: false,
        lastFetched: now,
        hasMore: 1 < totalPages,
        page: 1,
      });
      await AsyncStorage.setItem('cached_transactions', JSON.stringify(transactions));
    } catch (error: any) {
      set({ error: 'Failed to fetch transactions', isLoading: false });
      await get().loadCached();
    }
  },

  fetchMoreTransactions: async () => {
    const { page, hasMore, isLoadingMore, transactions } = get();
    
    if (!hasMore || isLoadingMore) return;

    try {
      set({ isLoadingMore: true });
      const nextPage = page + 1;
      const { data } = await transactionAPI.getAll({ page: nextPage, limit: 20 });
      
      const newTransactions = Array.isArray(data) ? data : (data.transactions || []);
      const totalPages = data.pages || 1;

      set({
        transactions: [...transactions, ...newTransactions],
        isLoadingMore: false,
        page: nextPage,
        hasMore: nextPage < totalPages,
      });
    } catch (error: any) {
      set({ isLoadingMore: false });
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
      const newTransaction = data.transaction || data;
      set({
        transactions: [newTransaction, ...get().transactions],
        lastFetched: Date.now()
      });
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
      set({ lastFetched: null }); // Force refresh
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
    } catch (error) { }
  },
}));
