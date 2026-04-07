/**
 * FinanceContext: Global state management for Velth
 * Handles all financial data operations and persistence
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { FinanceState, FinanceContextType, Envelope, Transaction } from './types';
import { storage } from './storage';

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

type Action =
  | { type: 'INIT'; payload: FinanceState }
  | { type: 'ADD_ENVELOPE'; payload: Envelope }
  | { type: 'UPDATE_ENVELOPE'; payload: Envelope }
  | { type: 'DELETE_ENVELOPE'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string };

function financeReducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'INIT':
      return action.payload;

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
        // Also delete all transactions for this envelope
        transactions: state.transactions.filter(
          (t) => t.envelopeId !== action.payload
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

    // Envelope actions
    addEnvelope: (name: string, budget: number) => {
      const envelope: Envelope = {
        id: generateId(),
        name,
        budget,
        spent: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dispatch({ type: 'ADD_ENVELOPE', payload: envelope });
    },

    updateEnvelope: (id: string, name: string, budget: number) => {
      const existing = state.envelopes.find((e) => e.id === id);
      if (existing) {
        const updated: Envelope = {
          ...existing,
          name,
          budget,
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

    // Transaction actions
    addTransaction: (amount: number, envelopeId: string, date: number, notes: string) => {
      const transaction: Transaction = {
        id: generateId(),
        amount,
        envelopeId,
        date,
        notes,
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
          // Moved to different envelope
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
