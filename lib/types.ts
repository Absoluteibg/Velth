/**
 * Core data types for Velth personal finance app
 */

export interface Envelope {
  id: string;
  name: string;
  budget: number; // Total budget allocated
  spent: number; // Total spent
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface Transaction {
  id: string;
  amount: number;
  envelopeId: string; // Reference to envelope
  date: number; // Timestamp (date of transaction)
  notes: string; // Optional notes
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
}

export interface FinanceState {
  envelopes: Envelope[];
  transactions: Transaction[];
}

export interface FinanceContextType {
  state: FinanceState;
  
  // Envelope actions
  addEnvelope: (name: string, budget: number) => void;
  updateEnvelope: (id: string, name: string, budget: number) => void;
  deleteEnvelope: (id: string) => void;
  getEnvelopeById: (id: string) => Envelope | undefined;
  
  // Transaction actions
  addTransaction: (amount: number, envelopeId: string, date: number, notes: string) => void;
  updateTransaction: (id: string, amount: number, envelopeId: string, date: number, notes: string) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByEnvelope: (envelopeId: string) => Transaction[];
  getTransactionsByMonth: (year: number, month: number) => Transaction[];
  
  // Stats
  getTotalSpent: () => number;
  getTotalBudget: () => number;
  getSpentByCategory: () => Record<string, number>;
  getMonthlySpending: () => Record<string, number>; // "YYYY-MM" -> amount
}
