/**
 * Test Suite for Error Handler
 * Tests error handling and recovery
 */

import { describe, it, expect } from 'vitest';
import { VelthErrorHandler, safeAsync, safeSync } from '../lib/error-handler';

describe('Error Creation', () => {
  it('should create error with all fields', () => {
    const error = VelthErrorHandler.createError(
      'TEST_ERROR',
      'Test error message',
      'error',
      'Test details'
    );

    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test error message');
    expect(error.severity).toBe('error');
    expect(error.details).toBe('Test details');
    expect(error.timestamp).toBeGreaterThan(0);
  });

  it('should create error with default severity', () => {
    const error = VelthErrorHandler.createError('TEST_ERROR', 'Test message');
    expect(error.severity).toBe('error');
  });
});

describe('Validation Errors', () => {
  it('should handle validation error', () => {
    const error = VelthErrorHandler.handleValidationError('email', 'Invalid format');
    expect(error.code).toContain('VALIDATION');
    expect(error.severity).toBe('warning');
  });
});

describe('Storage Errors', () => {
  it('should handle storage error', () => {
    const error = VelthErrorHandler.handleStorageError('save', new Error('Disk full'));
    expect(error.code).toBe('STORAGE_ERROR');
    expect(error.severity).toBe('error');
  });
});

describe('Transaction Errors', () => {
  it('should handle transaction error', () => {
    const error = VelthErrorHandler.handleTransactionError('add', new Error('Invalid amount'));
    expect(error.code).toBe('TRANSACTION_ERROR');
    expect(error.severity).toBe('error');
  });
});

describe('Envelope Errors', () => {
  it('should handle envelope error', () => {
    const error = VelthErrorHandler.handleEnvelopeError('create', new Error('Name exists'));
    expect(error.code).toBe('ENVELOPE_ERROR');
    expect(error.severity).toBe('error');
  });
});

describe('Import/Export Errors', () => {
  it('should handle import error', () => {
    const error = VelthErrorHandler.handleImportError(new Error('Invalid JSON'));
    expect(error.code).toBe('IMPORT_ERROR');
    expect(error.severity).toBe('error');
  });

  it('should handle export error', () => {
    const error = VelthErrorHandler.handleExportError(new Error('File write failed'));
    expect(error.code).toBe('EXPORT_ERROR');
    expect(error.severity).toBe('error');
  });
});

describe('Budget Errors', () => {
  it('should create insufficient funds error', () => {
    const error = VelthErrorHandler.insufficientFunds('Food', 100, 500);
    expect(error.code).toBe('INSUFFICIENT_FUNDS');
    expect(error.severity).toBe('warning');
    expect(error.message).toContain('Food');
  });

  it('should create budget exceeded error', () => {
    const error = VelthErrorHandler.budgetExceeded('Travel', 5000, 6000);
    expect(error.code).toBe('BUDGET_EXCEEDED');
    expect(error.severity).toBe('warning');
    expect(error.message).toContain('Travel');
  });
});

describe('Missing Data Errors', () => {
  it('should create missing envelope error', () => {
    const error = VelthErrorHandler.missingEnvelope('env-999');
    expect(error.code).toBe('MISSING_ENVELOPE');
    expect(error.severity).toBe('error');
  });

  it('should create missing transaction error', () => {
    const error = VelthErrorHandler.missingTransaction('txn-999');
    expect(error.code).toBe('MISSING_TRANSACTION');
    expect(error.severity).toBe('error');
  });
});

describe('User Messages', () => {
  it('should get user-friendly message for validation error', () => {
    const error = VelthErrorHandler.handleValidationError('email', 'Invalid format');
    const message = VelthErrorHandler.getUserMessage(error);
    expect(message).toContain('valid');
  });

  it('should get user-friendly message for storage error', () => {
    const error = VelthErrorHandler.handleStorageError('save', new Error('Disk full'));
    const message = VelthErrorHandler.getUserMessage(error);
    expect(message).toContain('save');
  });

  it('should get original message if no mapping exists', () => {
    const error = VelthErrorHandler.createError('UNKNOWN_ERROR', 'Unknown error occurred');
    const message = VelthErrorHandler.getUserMessage(error);
    expect(message).toBe('Unknown error occurred');
  });
});

describe('Error Severity Checks', () => {
  it('should identify critical error', () => {
    const error = VelthErrorHandler.createError('CRITICAL', 'Critical error', 'critical');
    expect(VelthErrorHandler.isCritical(error)).toBe(true);
  });

  it('should identify non-critical error', () => {
    const error = VelthErrorHandler.createError('WARNING', 'Warning', 'warning');
    expect(VelthErrorHandler.isCritical(error)).toBe(false);
  });

  it('should identify recoverable error', () => {
    const error = VelthErrorHandler.createError('ERROR', 'Error', 'error');
    expect(VelthErrorHandler.isRecoverable(error)).toBe(true);
  });

  it('should identify non-recoverable error', () => {
    const error = VelthErrorHandler.createError('CRITICAL', 'Critical', 'critical');
    expect(VelthErrorHandler.isRecoverable(error)).toBe(false);
  });
});

describe('Safe Async Operations', () => {
  it('should handle successful async operation', async () => {
    const result = await safeAsync(async () => {
      return 'success';
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.error).toBeUndefined();
  });

  it('should handle failed async operation', async () => {
    const result = await safeAsync(async () => {
      throw new Error('Test error');
    });

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('UNKNOWN_ERROR');
  });

  it('should use custom error code', async () => {
    const result = await safeAsync(
      async () => {
        throw new Error('Test error');
      },
      'CUSTOM_ERROR'
    );

    expect(result.error?.code).toBe('CUSTOM_ERROR');
  });
});

describe('Safe Sync Operations', () => {
  it('should handle successful sync operation', () => {
    const result = safeSync(() => {
      return 'success';
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.error).toBeUndefined();
  });

  it('should handle failed sync operation', () => {
    const result = safeSync(() => {
      throw new Error('Test error');
    });

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should use custom error code for sync', () => {
    const result = safeSync(
      () => {
        throw new Error('Test error');
      },
      'SYNC_ERROR'
    );

    expect(result.error?.code).toBe('SYNC_ERROR');
  });
});

describe('Error Logging', () => {
  it('should log error without throwing', () => {
    const error = VelthErrorHandler.createError('TEST', 'Test message');
    // Should not throw
    expect(() => VelthErrorHandler.logError(error)).not.toThrow();
  });
});

describe('Edge Cases', () => {
  it('should handle error with null details', () => {
    const error = VelthErrorHandler.createError('TEST', 'Test message', 'error');
    expect(error.details).toBeUndefined();
  });

  it('should handle error with empty message', () => {
    const error = VelthErrorHandler.createError('TEST', '');
    expect(error.message).toBe('');
  });

  it('should handle multiple errors in sequence', () => {
    const errors = [
      VelthErrorHandler.createError('ERROR1', 'First error'),
      VelthErrorHandler.createError('ERROR2', 'Second error'),
      VelthErrorHandler.createError('ERROR3', 'Third error'),
    ];

    expect(errors.length).toBe(3);
    expect(errors[0].code).toBe('ERROR1');
    expect(errors[2].code).toBe('ERROR3');
  });
});
