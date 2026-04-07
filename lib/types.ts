/**
 * Core data types for Velth personal finance app
 */

export interface Envelope {
  id: string;
  name: string;
  budget: number; // Total budget allocated
  spent: number; // Total spent
  openingBalance: number; // Starting balance
  goal: number; // Savings goal amount
  alertThreshold: number; // Alert when spending reaches this percentage (0-100)
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Transaction {
  id: string;
  amount: number;
  envelopeId: string; // Reference to envelope
  date: number; // Timestamp (date of transaction)
  notes: string; // Optional notes
  isRecurring: boolean; // Whether this is from a recurring transaction
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  amount: number;
  envelopeId: string;
  recurrenceType: RecurrenceType;
  notes: string;
  isActive: boolean;
  lastExecuted: number; // Timestamp of last auto-execution
  createdAt: number;
  updatedAt: number;
}

export interface FinanceState {
  envelopes: Envelope[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
}

export interface FinanceContextType {
  state: FinanceState;
  
  // Envelope actions
  addEnvelope: (name: string, budget: number, openingBalance?: number, goal?: number) => void;
  updateEnvelope: (id: string, name: string, budget: number, openingBalance?: number, goal?: number, alertThreshold?: number) => void;
  deleteEnvelope: (id: string) => void;
  getEnvelopeById: (id: string) => Envelope | undefined;
  adjustEnvelopeBalance: (id: string, amount: number, reason: string) => void; // Add/reduce balance
  
  // Transaction actions
  addTransaction: (amount: number, envelopeId: string, date: number, notes: string, isRecurring?: boolean) => void;
  updateTransaction: (id: string, amount: number, envelopeId: string, date: number, notes: string) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByEnvelope: (envelopeId: string) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  
  // Recurring transactions
  addRecurringTransaction: (amount: number, envelopeId: string, recurrenceType: RecurrenceType, notes: string) => void;
  updateRecurringTransaction: (id: string, amount: number, envelopeId: string, recurrenceType: RecurrenceType, notes: string) => void;
  deleteRecurringTransaction: (id: string) => void;
  getRecurringTransactions: () => RecurringTransaction[];
  processRecurringTransactions: () => void; // Auto-generate transactions
  
  // Stats
  getTotalSpent: () => number;
  getTotalBudget: () => number;
  getSpentByCategory: () => Record<string, number>;
  getMonthlySpending: () => Record<string, number>; // "YYYY-MM" -> amount
  getEnvelopesNearAlert: () => Envelope[]; // Envelopes that have reached alert threshold
}
