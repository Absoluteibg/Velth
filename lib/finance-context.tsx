/**
 * FinanceContext: Global state management for Velth
 * Handles all financial data operations and persistence
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { FinanceState, FinanceContextType, Envelope, Transaction, RecurringTransaction, RecurrenceType, UserProfile, AppSettings } from './types';
import { storage } from './storage';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

type Action =
  | { type: 'INIT'; payload: FinanceState }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings }
  | { type: 'ADD_ENVELOPE'; payload: Envelope }
  | { type: 'UPDATE_ENVELOPE'; payload: Envelope }
  | { type: 'DELETE_ENVELOPE'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringTransaction }
  | { type: 'UPDATE_RECURRING'; payload: RecurringTransaction }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'RESET_STATE'; payload: FinanceState };

function financeReducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'SET_USER_PROFILE':
      return {
        ...state,
        userProfile: action.payload,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: action.payload,
      };

    case 'ADD_ENVELOPE':
      return {
        ...state,
        envelopes: [...state.envelopes, action.payload],
      };

    case 'UPDATE_ENVELOPE':
      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_ENVELOPE':
      return {
        ...state,
        envelopes: state.envelopes.filter((e) => e.id !== action.payload),
        transactions: state.transactions.filter(
          (t) => t.envelopeId !== action.payload
        ),
        recurringTransactions: state.recurringTransactions.filter(
          (r) => r.envelopeId !== action.payload
        ),
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case 'ADD_RECURRING':
      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.payload],
      };

    case 'UPDATE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'DELETE_RECURRING':
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter(
          (r) => r.id !== action.payload
        ),
      };

    case 'RESET_STATE':
      return action.payload;

    default:
      return state;
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    financeReducer,
    storage.getInitialState()
  );

  // Load data from storage on mount
  useEffect(() => {
    const loadData = async () => {
      const savedState = await storage.loadState();
      if (savedState) {
        dispatch({ type: 'INIT', payload: savedState });
      }
    };
    loadData();
  }, []);

  // Save to storage whenever state changes
  useEffect(() => {
    storage.saveState(state);
  }, [state]);

  // Helper function to generate unique IDs
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper function to recalculate envelope spent amount
  const recalculateEnvelopeSpent = useCallback(
    (envelopeId: string) => {
      const spent = state.transactions
        .filter((t) => t.envelopeId === envelopeId)
        .reduce((sum, t) => sum + t.amount, 0);
      return spent;
    },
    [state.transactions]
  );

  const value: FinanceContextType = {
    state,

    // User Profile
    setUserProfile: (profile: Partial<UserProfile>) => {
      const updated: UserProfile = {
        ...state.userProfile,
        ...profile,
        updatedAt: Date.now(),
      };
      dispatch({ type: 'SET_USER_PROFILE', payload: updated });
    },

    getUserProfile: () => {
      return state.userProfile;
    },

    // Settings
    updateSettings: (settings: Partial<AppSettings>) => {
      const updated: AppSettings = {
        ...state.settings,
        ...settings,
      };
      dispatch({ type: 'UPDATE_SETTINGS', payload: updated });
    },

    getSettings: () => {
      return state.settings;
    },

    setCurrency: (currency) => {
      const updated: AppSettings = {
        ...state.settings,
        currency,
      };
      dispatch({ type: 'UPDATE_SETTINGS', payload: updated });

      // Also update user profile currency
      const updatedProfile: UserProfile = {
        ...state.userProfile,
        currency,
        updatedAt: Date.now(),
      };
      dispatch({ type: 'SET_USER_PROFILE', payload: updatedProfile });
    },

    // Envelope actions
    addEnvelope: (name: string, budget: number, openingBalance = 0, goal = 0) => {
      const envelope: Envelope = {
        id: generateId(),
        name,
        budget,
        spent: 0,
        openingBalance,
        goal,
        alertThreshold: 80,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_ENVELOPE', payload: envelope });
    },

    updateEnvelope: (id: string, name: string, budget: number, openingBalance = 0, goal = 0, alertThreshold = 80, spendingCap = 0) => {
      const existing = state.envelopes.find((e) => e.id === id);
      if (existing) {
        const updated: Envelope = {
          ...existing,
          name,
          budget,
          openingBalance,
          goal,
          alertThreshold,
          spendingCap: spendingCap > 0 ? spendingCap : undefined,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_ENVELOPE', payload: updated });
      }
    },

    deleteEnvelope: (id: string) => {
      dispatch({ type: 'DELETE_ENVELOPE', payload: id });
    },

    getEnvelopeById: (id: string) => {
      return state.envelopes.find((e) => e.id === id);
    },

    adjustEnvelopeBalance: (id: string, amount: number, reason: string) => {
      const existing = state.envelopes.find((e) => e.id === id);
      if (existing) {
        // Create a transaction to track the adjustment
        const transaction: Transaction = {
          id: generateId(),
          amount: Math.abs(amount),
          envelopeId: id,
          date: Date.now(),
          notes: `Balance adjustment: ${reason}`,
          isRecurring: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

        // Update envelope spent
        const newSpent = existing.spent + Math.abs(amount);
        const updated: Envelope = {
          ...existing,
          spent: newSpent,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_ENVELOPE', payload: updated });
      }
    },

    // Transaction actions
    addTransaction: (amount: number, envelopeId: string, date: number, notes: string, isRecurring = false) => {
      const transaction: Transaction = {
        id: generateId(),
        amount,
        envelopeId,
        date,
        notes,
        isRecurring,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });

      // Update envelope spent amount
      const envelope = state.envelopes.find((e) => e.id === envelopeId);
      if (envelope) {
        const newSpent = recalculateEnvelopeSpent(envelopeId) + amount;
        const updated: Envelope = {
          ...envelope,
          spent: newSpent,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_ENVELOPE', payload: updated });
      }
    },

    updateTransaction: (id: string, amount: number, envelopeId: string, date: number, notes: string) => {
      const existing = state.transactions.find((t) => t.id === id);
      if (existing) {
        const updated: Transaction = {
          ...existing,
          amount,
          envelopeId,
          date,
          notes,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updated });

        // Recalculate spent for both old and new envelope
        if (existing.envelopeId !== envelopeId) {
          const oldEnvelope = state.envelopes.find((e) => e.id === existing.envelopeId);
          if (oldEnvelope) {
            const oldSpent = recalculateEnvelopeSpent(existing.envelopeId) - existing.amount;
            dispatch({
              type: 'UPDATE_ENVELOPE',
              payload: {
                ...oldEnvelope,
                spent: Math.max(0, oldSpent),
                updatedAt: Date.now(),
              },
            });
          }
        }

        const newEnvelope = state.envelopes.find((e) => e.id === envelopeId);
        if (newEnvelope) {
          const newSpent = recalculateEnvelopeSpent(envelopeId);
          dispatch({
            type: 'UPDATE_ENVELOPE',
            payload: {
              ...newEnvelope,
              spent: newSpent,
              updatedAt: Date.now(),
            },
          });
        }
      }
    },

    deleteTransaction: (id: string) => {
      const transaction = state.transactions.find((t) => t.id === id);
      if (transaction) {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id });

        // Recalculate envelope spent
        const envelope = state.envelopes.find((e) => e.id === transaction.envelopeId);
        if (envelope) {
          const newSpent = recalculateEnvelopeSpent(transaction.envelopeId);
          dispatch({
            type: 'UPDATE_ENVELOPE',
            payload: {
              ...envelope,
              spent: newSpent,
              updatedAt: Date.now(),
            },
          });
        }
      }
    },

    getTransactionsByEnvelope: (envelopeId: string) => {
      return state.transactions.filter((t) => t.envelopeId === envelopeId);
    },

    getTransactionsByMonth: (year: number, month: number) => {
      return state.transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month - 1;
      });
    },

    // Recurring transactions
    addRecurringTransaction: (amount: number, envelopeId: string, recurrenceType: RecurrenceType, notes: string) => {
      const recurring: RecurringTransaction = {
        id: generateId(),
        amount,
        envelopeId,
        recurrenceType,
        notes,
        isActive: true,
        lastExecuted: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_RECURRING', payload: recurring });
    },

    updateRecurringTransaction: (id: string, amount: number, envelopeId: string, recurrenceType: RecurrenceType, notes: string) => {
      const existing = state.recurringTransactions.find((r) => r.id === id);
      if (existing) {
        const updated: RecurringTransaction = {
          ...existing,
          amount,
          envelopeId,
          recurrenceType,
          notes,
          updatedAt: Date.now(),
        };
        dispatch({ type: 'UPDATE_RECURRING', payload: updated });
      }
    },

    deleteRecurringTransaction: (id: string) => {
      dispatch({ type: 'DELETE_RECURRING', payload: id });
    },

    getRecurringTransactions: () => {
      return state.recurringTransactions;
    },

    processRecurringTransactions: () => {
      // Auto-generate transactions based on recurrence rules
      const now = Date.now();
      state.recurringTransactions.forEach((recurring) => {
        if (!recurring.isActive) return;

        const lastExecuted = new Date(recurring.lastExecuted);
        const today = new Date(now);

        let shouldExecute = false;

        switch (recurring.recurrenceType) {
          case 'daily':
            shouldExecute = lastExecuted.getDate() !== today.getDate();
            break;
          case 'weekly':
            shouldExecute = Math.floor((now - recurring.lastExecuted) / (7 * 24 * 60 * 60 * 1000)) >= 1;
            break;
          case 'monthly':
            shouldExecute = lastExecuted.getMonth() !== today.getMonth();
            break;
          case 'yearly':
            shouldExecute = lastExecuted.getFullYear() !== today.getFullYear();
            break;
        }

        if (shouldExecute && recurring.lastExecuted > 0) {
          // Auto-create transaction
          value.addTransaction(recurring.amount, recurring.envelopeId, now, recurring.notes, true);

          // Update lastExecuted
          const updated: RecurringTransaction = {
            ...recurring,
            lastExecuted: now,
            updatedAt: Date.now(),
          };
          dispatch({ type: 'UPDATE_RECURRING', payload: updated });
        }
      });
    },

    // Backup & Restore
    exportDataAsJSON: () => {
      return JSON.stringify(state, null, 2);
    },

    importDataFromJSON: (jsonData: string) => {
      try {
        const importedState = JSON.parse(jsonData) as FinanceState;
        // Validate structure
        if (importedState.userProfile && importedState.settings && Array.isArray(importedState.envelopes)) {
          dispatch({ type: 'RESET_STATE', payload: importedState });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error importing data:', error);
        return false;
      }
    },

    deleteAllData: () => {
      const initialState = storage.getInitialState();
      dispatch({ type: 'RESET_STATE', payload: initialState });
    },

    // Stats
    getTotalSpent: () => {
      return state.transactions.reduce((sum, t) => sum + t.amount, 0);
    },

    getTotalBudget: () => {
      return state.envelopes.reduce((sum, e) => sum + e.budget, 0);
    },

    getSpentByCategory: () => {
      const result: Record<string, number> = {};
      state.transactions.forEach((t) => {
        const envelope = state.envelopes.find((e) => e.id === t.envelopeId);
        if (envelope) {
          result[envelope.name] = (result[envelope.name] || 0) + t.amount;
        }
      });
      return result;
    },

    getMonthlySpending: () => {
      const result: Record<string, number> = {};
      state.transactions.forEach((t) => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        result[key] = (result[key] || 0) + t.amount;
      });
      return result;
    },

    getEnvelopesNearAlert: () => {
      return state.envelopes.filter((envelope) => {
        const percentageUsed = envelope.budget > 0 ? (envelope.spent / envelope.budget) * 100 : 0;
        return percentageUsed >= envelope.alertThreshold;
      });
    },

    getEnvelopesNearLimit: () => {
      return state.envelopes.filter((envelope) => {
        if (!envelope.spendingCap || envelope.spendingCap === 0) return false;
        return envelope.spent >= envelope.spendingCap * 0.8; // Alert at 80% of spending cap
      });
    },
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}
