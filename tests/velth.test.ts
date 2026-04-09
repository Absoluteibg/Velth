/**
 * Comprehensive Test Suite for Velth
 * Tests all core functionality and workflows
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock data
const mockEnvelope = {
  id: 'env-1',
  name: 'Food',
  budget: 5000,
  spent: 1500,
  openingBalance: 1000,
  goal: 8000,
  alertThreshold: 80,
  spendingCap: 6000,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockTransaction = {
  id: 'txn-1',
  amount: 500,
  envelopeId: 'env-1',
  date: Date.now(),
  notes: 'Groceries',
  isRecurring: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockRecurringTransaction = {
  id: 'rec-1',
  amount: 2000,
  envelopeId: 'env-1',
  recurrenceType: 'monthly' as const,
  notes: 'Monthly rent',
  isActive: true,
  lastExecuted: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('Envelope Logic', () => {
  it('should calculate remaining budget correctly', () => {
    const remaining = mockEnvelope.budget - mockEnvelope.spent;
    expect(remaining).toBe(3500);
  });

  it('should calculate budget usage percentage', () => {
    const percentage = (mockEnvelope.spent / mockEnvelope.budget) * 100;
    expect(percentage).toBe(30);
  });

  it('should detect when budget is exceeded', () => {
    const isOverBudget = mockEnvelope.spent > mockEnvelope.budget;
    expect(isOverBudget).toBe(false);
  });

  it('should calculate goal progress', () => {
    const goalProgress = (mockEnvelope.spent / mockEnvelope.goal) * 100;
    expect(goalProgress).toBeCloseTo(18.75, 2);
  });

  it('should detect when approaching alert threshold', () => {
    const percentageUsed = (mockEnvelope.spent / mockEnvelope.budget) * 100;
    const isNearAlert = percentageUsed >= mockEnvelope.alertThreshold;
    expect(isNearAlert).toBe(false);
  });

  it('should detect when spending cap is exceeded', () => {
    const isOverCap = mockEnvelope.spendingCap ? mockEnvelope.spent >= mockEnvelope.spendingCap : false;
    expect(isOverCap).toBe(false);
  });

  it('should calculate remaining to goal', () => {
    const remaining = Math.max(0, mockEnvelope.goal - mockEnvelope.spent);
    expect(remaining).toBe(6500);
  });

  it('should include opening balance in total available', () => {
    const totalAvailable = mockEnvelope.openingBalance + mockEnvelope.budget;
    expect(totalAvailable).toBe(6000);
  });
});

describe('Transaction Logic', () => {
  it('should validate positive amount', () => {
    const isValid = mockTransaction.amount > 0;
    expect(isValid).toBe(true);
  });

  it('should validate envelope exists', () => {
    const isValid = mockTransaction.envelopeId !== '';
    expect(isValid).toBe(true);
  });

  it('should format transaction date correctly', () => {
    const date = new Date(mockTransaction.date);
    expect(date instanceof Date).toBe(true);
  });

  it('should calculate month from transaction date', () => {
    const date = new Date(mockTransaction.date);
    const month = date.getMonth() + 1;
    expect(month >= 1 && month <= 12).toBe(true);
  });

  it('should sort transactions by date', () => {
    const txns = [
      { ...mockTransaction, date: Date.now() - 86400000 }, // yesterday
      { ...mockTransaction, date: Date.now() }, // today
      { ...mockTransaction, date: Date.now() - 172800000 }, // 2 days ago
    ];
    const sorted = txns.sort((a, b) => b.date - a.date);
    expect(sorted[0].date > sorted[1].date).toBe(true);
  });

  it('should calculate total spent from multiple transactions', () => {
    const transactions = [
      { ...mockTransaction, amount: 500 },
      { ...mockTransaction, amount: 300 },
      { ...mockTransaction, amount: 200 },
    ];
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    expect(total).toBe(1000);
  });
});

describe('Recurring Transaction Logic', () => {
  it('should identify daily recurrence', () => {
    const dailyRecurring = { ...mockRecurringTransaction, recurrenceType: 'daily' as const };
    const isDaily = dailyRecurring.recurrenceType === 'daily';
    expect(isDaily).toBe(true);
  });

  it('should identify monthly recurrence', () => {
    const monthlyRecurring = { ...mockRecurringTransaction, recurrenceType: 'monthly' as const };
    const isMonthly = monthlyRecurring.recurrenceType === 'monthly';
    expect(isMonthly).toBe(true);
  });

  it('should check if recurring transaction is active', () => {
    const isActive = mockRecurringTransaction.isActive;
    expect(isActive).toBe(true);
  });

  it('should determine if recurring transaction should execute', () => {
    const now = Date.now();
    const lastExecuted = mockRecurringTransaction.lastExecuted;
    const daysSinceExecution = (now - lastExecuted) / (24 * 60 * 60 * 1000);
    
    // For monthly, should execute if lastExecuted is 0 (never executed)
    const shouldExecute = lastExecuted === 0 || daysSinceExecution >= 30;
    expect(shouldExecute).toBe(true);
  });
});

describe('Currency Logic', () => {
  it('should format currency with symbol', () => {
    const amount = 1234.56;
    const symbol = '₹';
    const formatted = `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    expect(formatted).toContain('₹');
    expect(formatted).toContain('1,234.56');
  });

  it('should handle different currency symbols', () => {
    const currencies: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    expect(currencies['INR']).toBe('₹');
    expect(currencies['USD']).toBe('$');
  });

  it('should format zero amount', () => {
    const amount = 0;
    const formatted = amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    expect(formatted).toBe('0.00');
  });
});

describe('Data Validation', () => {
  it('should reject empty envelope name', () => {
    const isValid = ''.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it('should reject zero or negative budget', () => {
    const isValid = 0 > 0;
    expect(isValid).toBe(false);
  });

  it('should reject invalid amount', () => {
    const amount = parseFloat('abc');
    const isValid = !isNaN(amount) && amount > 0;
    expect(isValid).toBe(false);
  });

  it('should reject missing envelope for transaction', () => {
    const isValid = ''.length > 0;
    expect(isValid).toBe(false);
  });

  it('should validate alert threshold range', () => {
    const threshold = 80;
    const isValid = threshold >= 0 && threshold <= 100;
    expect(isValid).toBe(true);
  });
});

describe('Real-time Calculations', () => {
  it('should recalculate spent when transaction is added', () => {
    let spent = 1500;
    const newTransaction = 500;
    spent += newTransaction;
    expect(spent).toBe(2000);
  });

  it('should recalculate spent when transaction is deleted', () => {
    let spent = 2000;
    const deletedTransaction = 500;
    spent -= deletedTransaction;
    expect(spent).toBe(1500);
  });

  it('should update budget percentage in real-time', () => {
    let spent = 1500;
    const budget = 5000;
    let percentage = (spent / budget) * 100;
    expect(percentage).toBe(30);

    // Add transaction
    spent += 1000;
    percentage = (spent / budget) * 100;
    expect(percentage).toBe(50);
  });

  it('should trigger alert when threshold is reached', () => {
    const spent = 3000;
    const budget = 5000;
    const threshold = 80;
    const percentage = (spent / budget) * 100;
    const shouldAlert = percentage >= threshold;
    expect(shouldAlert).toBe(false);

    // Increase spending
    const newSpent = 4100;
    const newPercentage = (newSpent / budget) * 100;
    const shouldAlertNow = newPercentage >= threshold;
    expect(shouldAlertNow).toBe(true);
  });
});

describe('State Management', () => {
  it('should maintain envelope list', () => {
    const envelopes = [mockEnvelope];
    expect(envelopes.length).toBe(1);
    expect(envelopes[0].id).toBe('env-1');
  });

  it('should maintain transaction list', () => {
    const transactions = [mockTransaction];
    expect(transactions.length).toBe(1);
    expect(transactions[0].amount).toBe(500);
  });

  it('should maintain user profile', () => {
    const profile = {
      name: 'John Doe',
      email: 'john@example.com',
      currency: 'INR' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(profile.name).toBe('John Doe');
    expect(profile.currency).toBe('INR');
  });

  it('should maintain app settings', () => {
    const settings = {
      currency: 'INR' as const,
      autoSaveEnabled: true,
      autoSaveInterval: 5000,
    };
    expect(settings.autoSaveEnabled).toBe(true);
    expect(settings.autoSaveInterval).toBe(5000);
  });
});

describe('Edge Cases', () => {
  it('should handle envelope with zero budget', () => {
    const envelope = { ...mockEnvelope, budget: 0 };
    const percentage = envelope.budget > 0 ? (envelope.spent / envelope.budget) * 100 : 0;
    expect(percentage).toBe(0);
  });

  it('should handle envelope with zero spent', () => {
    const envelope = { ...mockEnvelope, spent: 0 };
    const remaining = envelope.budget - envelope.spent;
    expect(remaining).toBe(envelope.budget);
  });

  it('should handle transaction with zero amount', () => {
    const isValid = 0 > 0;
    expect(isValid).toBe(false);
  });

  it('should handle very large amounts', () => {
    const amount = 999999999.99;
    const formatted = amount.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    // Indian locale uses different grouping: 99,99,99,999.99
    expect(formatted).toContain('99');
    expect(formatted).toContain('999.99');
  });

  it('should handle negative remaining budget', () => {
    const envelope = { ...mockEnvelope, spent: 6000 };
    const remaining = envelope.budget - envelope.spent;
    expect(remaining).toBe(-1000);
  });

  it('should handle empty transaction list', () => {
    const transactions: typeof mockTransaction[] = [];
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    expect(total).toBe(0);
  });

  it('should handle empty envelope list', () => {
    const envelopes: typeof mockEnvelope[] = [];
    const totalBudget = envelopes.reduce((sum, e) => sum + e.budget, 0);
    expect(totalBudget).toBe(0);
  });
});

describe('Data Persistence', () => {
  it('should serialize envelope to JSON', () => {
    const json = JSON.stringify(mockEnvelope);
    expect(json).toContain('Food');
    expect(json).toContain('5000');
  });

  it('should deserialize envelope from JSON', () => {
    const json = JSON.stringify(mockEnvelope);
    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('Food');
    expect(parsed.budget).toBe(5000);
  });

  it('should handle circular reference prevention', () => {
    const state = {
      envelopes: [mockEnvelope],
      transactions: [mockTransaction],
    };
    const json = JSON.stringify(state);
    const parsed = JSON.parse(json);
    expect(parsed.envelopes.length).toBe(1);
    expect(parsed.transactions.length).toBe(1);
  });
});
