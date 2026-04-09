/**
 * Test Suite for Validators
 * Tests all validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateEnvelopeName,
  validateBudgetAmount,
  validateTransactionAmount,
  validateAlertThreshold,
  validateUserName,
  validateEmail,
  validateTransactionNotes,
  validateTransactionDate,
  validateEnvelopeExists,
  validateEnvelopeForm,
  validateTransactionForm,
} from '../lib/validators';

describe('Envelope Name Validation', () => {
  it('should accept valid envelope name', () => {
    const result = validateEnvelopeName('Groceries');
    expect(result.valid).toBe(true);
  });

  it('should reject empty name', () => {
    const result = validateEnvelopeName('');
    expect(result.valid).toBe(false);
  });

  it('should reject name with only spaces', () => {
    const result = validateEnvelopeName('   ');
    expect(result.valid).toBe(false);
  });

  it('should reject name less than 2 characters', () => {
    const result = validateEnvelopeName('A');
    expect(result.valid).toBe(false);
  });

  it('should reject name longer than 50 characters', () => {
    const result = validateEnvelopeName('A'.repeat(51));
    expect(result.valid).toBe(false);
  });

  it('should accept name with exactly 50 characters', () => {
    const result = validateEnvelopeName('A'.repeat(50));
    expect(result.valid).toBe(true);
  });
});

describe('Budget Amount Validation', () => {
  it('should accept valid budget amount', () => {
    const result = validateBudgetAmount('5000');
    expect(result.valid).toBe(true);
  });

  it('should accept decimal budget amount', () => {
    const result = validateBudgetAmount('5000.50');
    expect(result.valid).toBe(true);
  });

  it('should reject empty amount', () => {
    const result = validateBudgetAmount('');
    expect(result.valid).toBe(false);
  });

  it('should reject non-numeric amount', () => {
    const result = validateBudgetAmount('abc');
    expect(result.valid).toBe(false);
  });

  it('should reject zero amount', () => {
    const result = validateBudgetAmount('0');
    expect(result.valid).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = validateBudgetAmount('-100');
    expect(result.valid).toBe(false);
  });

  it('should reject amount larger than max', () => {
    const result = validateBudgetAmount('999999999.99');
    expect(result.valid).toBe(false);
  });
});

describe('Transaction Amount Validation', () => {
  it('should accept valid transaction amount', () => {
    const result = validateTransactionAmount('500');
    expect(result.valid).toBe(true);
  });

  it('should accept decimal transaction amount', () => {
    const result = validateTransactionAmount('500.75');
    expect(result.valid).toBe(true);
  });

  it('should reject empty amount', () => {
    const result = validateTransactionAmount('');
    expect(result.valid).toBe(false);
  });

  it('should reject zero amount', () => {
    const result = validateTransactionAmount('0');
    expect(result.valid).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = validateTransactionAmount('-50');
    expect(result.valid).toBe(false);
  });
});

describe('Alert Threshold Validation', () => {
  it('should accept valid threshold', () => {
    const result = validateAlertThreshold('80');
    expect(result.valid).toBe(true);
  });

  it('should accept threshold 0', () => {
    const result = validateAlertThreshold('0');
    expect(result.valid).toBe(true);
  });

  it('should accept threshold 100', () => {
    const result = validateAlertThreshold('100');
    expect(result.valid).toBe(true);
  });

  it('should reject threshold less than 0', () => {
    const result = validateAlertThreshold('-1');
    expect(result.valid).toBe(false);
  });

  it('should reject threshold greater than 100', () => {
    const result = validateAlertThreshold('101');
    expect(result.valid).toBe(false);
  });

  it('should reject non-numeric threshold', () => {
    const result = validateAlertThreshold('abc');
    expect(result.valid).toBe(false);
  });
});

describe('User Name Validation', () => {
  it('should accept valid user name', () => {
    const result = validateUserName('John Doe');
    expect(result.valid).toBe(true);
  });

  it('should reject empty name', () => {
    const result = validateUserName('');
    expect(result.valid).toBe(false);
  });

  it('should reject name less than 2 characters', () => {
    const result = validateUserName('J');
    expect(result.valid).toBe(false);
  });

  it('should reject name longer than 100 characters', () => {
    const result = validateUserName('A'.repeat(101));
    expect(result.valid).toBe(false);
  });
});

describe('Email Validation', () => {
  it('should accept valid email', () => {
    const result = validateEmail('john@example.com');
    expect(result.valid).toBe(true);
  });

  it('should accept empty email (optional)', () => {
    const result = validateEmail('');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
  });

  it('should reject email without domain', () => {
    const result = validateEmail('john@');
    expect(result.valid).toBe(false);
  });
});

describe('Transaction Notes Validation', () => {
  it('should accept valid notes', () => {
    const result = validateTransactionNotes('Grocery shopping at market');
    expect(result.valid).toBe(true);
  });

  it('should accept empty notes', () => {
    const result = validateTransactionNotes('');
    expect(result.valid).toBe(true);
  });

  it('should reject notes longer than 500 characters', () => {
    const result = validateTransactionNotes('A'.repeat(501));
    expect(result.valid).toBe(false);
  });

  it('should accept notes with exactly 500 characters', () => {
    const result = validateTransactionNotes('A'.repeat(500));
    expect(result.valid).toBe(true);
  });
});

describe('Transaction Date Validation', () => {
  it('should accept today date', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const result = validateTransactionDate(today.getTime());
    expect(result.valid).toBe(true);
  });

  it('should accept past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = validateTransactionDate(pastDate.getTime());
    expect(result.valid).toBe(true);
  });

  it('should reject future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const result = validateTransactionDate(futureDate.getTime());
    expect(result.valid).toBe(false);
  });
});

describe('Envelope Exists Validation', () => {
  const mockEnvelopes = [
    { id: 'env-1', name: 'Food' },
    { id: 'env-2', name: 'Travel' },
  ];

  it('should accept existing envelope', () => {
    const result = validateEnvelopeExists('env-1', mockEnvelopes);
    expect(result.valid).toBe(true);
  });

  it('should reject non-existing envelope', () => {
    const result = validateEnvelopeExists('env-999', mockEnvelopes);
    expect(result.valid).toBe(false);
  });

  it('should reject empty envelope id', () => {
    const result = validateEnvelopeExists('', mockEnvelopes);
    expect(result.valid).toBe(false);
  });
});

describe('Envelope Form Validation', () => {
  it('should accept valid envelope form', () => {
    const result = validateEnvelopeForm('Food', '5000', '1000', '8000', '80');
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should reject form with invalid name', () => {
    const result = validateEnvelopeForm('', '5000', '1000', '8000', '80');
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('should reject form with invalid budget', () => {
    const result = validateEnvelopeForm('Food', 'abc', '1000', '8000', '80');
    expect(result.valid).toBe(false);
    expect(result.errors.budget).toBeDefined();
  });

  it('should reject form with invalid threshold', () => {
    const result = validateEnvelopeForm('Food', '5000', '1000', '8000', '150');
    expect(result.valid).toBe(false);
    expect(result.errors.alertThreshold).toBeDefined();
  });

  it('should allow optional opening balance and goal', () => {
    const result = validateEnvelopeForm('Food', '5000', '', '', '80');
    expect(result.valid).toBe(true);
  });
});

describe('Transaction Form Validation', () => {
  const mockEnvelopes = [
    { id: 'env-1', name: 'Food' },
    { id: 'env-2', name: 'Travel' },
  ];

  it('should accept valid transaction form', () => {
    const today = new Date().getTime();
    const result = validateTransactionForm('500', 'env-1', today, 'Groceries', mockEnvelopes);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should reject form with invalid amount', () => {
    const today = new Date().getTime();
    const result = validateTransactionForm('abc', 'env-1', today, 'Groceries', mockEnvelopes);
    expect(result.valid).toBe(false);
    expect(result.errors.amount).toBeDefined();
  });

  it('should reject form with invalid envelope', () => {
    const today = new Date().getTime();
    const result = validateTransactionForm('500', 'env-999', today, 'Groceries', mockEnvelopes);
    expect(result.valid).toBe(false);
    expect(result.errors.envelope).toBeDefined();
  });

  it('should reject form with future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const result = validateTransactionForm('500', 'env-1', futureDate.getTime(), 'Groceries', mockEnvelopes);
    expect(result.valid).toBe(false);
    expect(result.errors.date).toBeDefined();
  });
});
