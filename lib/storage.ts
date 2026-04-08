/**
 * AsyncStorage persistence layer for Velth
 * Handles saving and loading financial data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FinanceState, UserProfile, AppSettings } from './types';

const STORAGE_KEY = 'velth_finance_data';

export const storage = {
  /**
   * Load financial data from AsyncStorage
   */
  async loadState(): Promise<FinanceState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error loading state from storage:', error);
      return null;
    }
  },

  /**
   * Save financial data to AsyncStorage
   */
  async saveState(state: FinanceState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state to storage:', error);
    }
  },

  /**
   * Clear all financial data
   */
  async clearState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing state from storage:', error);
    }
  },

  /**
   * Get initial state (empty if no data exists)
   */
  getInitialState(): FinanceState {
    const defaultProfile: UserProfile = {
      id: 'user_' + Date.now(),
      name: 'User',
      email: '',
      currency: 'INR',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const defaultSettings: AppSettings = {
      currency: 'INR',
      theme: 'light',
      autoSaveEnabled: true,
      autoSaveInterval: 5000, // 5 seconds
      notifications: true,
    };

    return {
      userProfile: defaultProfile,
      settings: defaultSettings,
      envelopes: [],
      transactions: [],
      recurringTransactions: [],
    };
  },
};
