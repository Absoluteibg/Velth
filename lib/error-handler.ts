/**
 * Error Handling Utilities for Velth
 * Centralized error handling and user-friendly messages
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface VelthError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  details?: string;
  timestamp: number;
}

export class VelthErrorHandler {
  /**
   * Create a standardized error
   */
  static createError(
    code: string,
    message: string,
    severity: ErrorSeverity = 'error',
    details?: string
  ): VelthError {
    return {
      code,
      message,
      severity,
      details,
      timestamp: Date.now(),
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(field: string, error: string): VelthError {
    return this.createError(
      `VALIDATION_${field.toUpperCase()}`,
      `Invalid ${field}: ${error}`,
      'warning'
    );
  }

  /**
   * Handle storage errors
   */
  static handleStorageError(operation: string, error: any): VelthError {
    return this.createError(
      'STORAGE_ERROR',
      `Failed to ${operation} data. Please try again.`,
      'error',
      error?.message
    );
  }

  /**
   * Handle transaction errors
   */
  static handleTransactionError(operation: string, error: any): VelthError {
    return this.createError(
      'TRANSACTION_ERROR',
      `Failed to ${operation} transaction. Please try again.`,
      'error',
      error?.message
    );
  }

  /**
   * Handle envelope errors
   */
  static handleEnvelopeError(operation: string, error: any): VelthError {
    return this.createError(
      'ENVELOPE_ERROR',
      `Failed to ${operation} envelope. Please try again.`,
      'error',
      error?.message
    );
  }

  /**
   * Handle data import errors
   */
  static handleImportError(error: any): VelthError {
    return this.createError(
      'IMPORT_ERROR',
      'Failed to import data. Please check the file format and try again.',
      'error',
      error?.message
    );
  }

  /**
   * Handle export errors
   */
  static handleExportError(error: any): VelthError {
    return this.createError(
      'EXPORT_ERROR',
      'Failed to export data. Please try again.',
      'error',
      error?.message
    );
  }

  /**
   * Handle insufficient funds
   */
  static insufficientFunds(envelopeName: string, available: number, required: number): VelthError {
    return this.createError(
      'INSUFFICIENT_FUNDS',
      `${envelopeName} has insufficient funds. Available: ${available}, Required: ${required}`,
      'warning'
    );
  }

  /**
   * Handle budget exceeded
   */
  static budgetExceeded(envelopeName: string, budget: number, spent: number): VelthError {
    return this.createError(
      'BUDGET_EXCEEDED',
      `${envelopeName} budget exceeded. Budget: ${budget}, Spent: ${spent}`,
      'warning'
    );
  }

  /**
   * Handle missing envelope
   */
  static missingEnvelope(envelopeId: string): VelthError {
    return this.createError(
      'MISSING_ENVELOPE',
      `Envelope not found. Please select a valid envelope.`,
      'error'
    );
  }

  /**
   * Handle missing transaction
   */
  static missingTransaction(transactionId: string): VelthError {
    return this.createError(
      'MISSING_TRANSACTION',
      `Transaction not found. It may have been deleted.`,
      'error'
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: VelthError): string {
    const messages: Record<string, string> = {
      VALIDATION_NAME: 'Please enter a valid name',
      VALIDATION_BUDGET: 'Please enter a valid budget amount',
      VALIDATION_AMOUNT: 'Please enter a valid amount',
      VALIDATION_EMAIL: 'Please enter a valid email address',
      STORAGE_ERROR: 'Unable to save data. Please check your storage and try again.',
      TRANSACTION_ERROR: 'Unable to process transaction. Please try again.',
      ENVELOPE_ERROR: 'Unable to process envelope. Please try again.',
      IMPORT_ERROR: 'Unable to import data. Please check the file format.',
      EXPORT_ERROR: 'Unable to export data. Please try again.',
      INSUFFICIENT_FUNDS: 'Insufficient funds in this envelope.',
      BUDGET_EXCEEDED: 'Budget exceeded for this envelope.',
      MISSING_ENVELOPE: 'The selected envelope no longer exists.',
      MISSING_TRANSACTION: 'The transaction no longer exists.',
    };

    return messages[error.code] || error.message;
  }

  /**
   * Log error for debugging
   */
  static logError(error: VelthError): void {
    const timestamp = new Date(error.timestamp).toISOString();
    console.error(`[${timestamp}] ${error.code}: ${error.message}`);
    if (error.details) {
      console.error(`Details: ${error.details}`);
    }
  }

  /**
   * Check if error is critical
   */
  static isCritical(error: VelthError): boolean {
    return error.severity === 'critical';
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: VelthError): boolean {
    return error.severity !== 'critical';
  }
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorCode: string = 'UNKNOWN_ERROR'
): Promise<{ success: boolean; data?: T; error?: VelthError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const velthError = VelthErrorHandler.createError(
      errorCode,
      'An unexpected error occurred',
      'error',
      error instanceof Error ? error.message : String(error)
    );
    VelthErrorHandler.logError(velthError);
    return { success: false, error: velthError };
  }
}

/**
 * Safe sync operation wrapper
 */
export function safeSync<T>(
  operation: () => T,
  errorCode: string = 'UNKNOWN_ERROR'
): { success: boolean; data?: T; error?: VelthError } {
  try {
    const data = operation();
    return { success: true, data };
  } catch (error) {
    const velthError = VelthErrorHandler.createError(
      errorCode,
      'An unexpected error occurred',
      'error',
      error instanceof Error ? error.message : String(error)
    );
    VelthErrorHandler.logError(velthError);
    return { success: false, error: velthError };
  }
}
