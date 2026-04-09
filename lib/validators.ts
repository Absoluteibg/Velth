/**
 * Real-time Validation Utilities for Velth
 * Validates all user inputs and data integrity
 */

/**
 * Validate envelope name
 */
export function validateEnvelopeName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Envelope name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Envelope name must be at least 2 characters' };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: 'Envelope name must be less than 50 characters' };
  }
  return { valid: true };
}

/**
 * Validate budget amount
 */
export function validateBudgetAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount || !amount.trim()) {
    return { valid: false, error: 'Budget amount is required' };
  }
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Budget must be a valid number' };
  }
  if (parsed <= 0) {
    return { valid: false, error: 'Budget must be greater than 0' };
  }
  if (parsed > 999999999) {
    return { valid: false, error: 'Budget amount is too large' };
  }
  return { valid: true };
}

/**
 * Validate transaction amount
 */
export function validateTransactionAmount(amount: string): { valid: boolean; error?: string } {
  if (!amount || !amount.trim()) {
    return { valid: false, error: 'Amount is required' };
  }
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  if (parsed <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (parsed > 999999999) {
    return { valid: false, error: 'Amount is too large' };
  }
  return { valid: true };
}

/**
 * Validate alert threshold
 */
export function validateAlertThreshold(threshold: string): { valid: boolean; error?: string } {
  const parsed = parseFloat(threshold);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Alert threshold must be a valid number' };
  }
  if (parsed < 0 || parsed > 100) {
    return { valid: false, error: 'Alert threshold must be between 0 and 100' };
  }
  return { valid: true };
}

/**
 * Validate user name
 */
export function validateUserName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  return { valid: true };
}

/**
 * Validate email (optional but if provided, must be valid)
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: true }; // Email is optional
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

/**
 * Validate transaction notes
 */
export function validateTransactionNotes(notes: string): { valid: boolean; error?: string } {
  if (notes && notes.length > 500) {
    return { valid: false, error: 'Notes must be less than 500 characters' };
  }
  return { valid: true };
}

/**
 * Validate date is not in future
 */
export function validateTransactionDate(date: number): { valid: boolean; error?: string } {
  const transactionDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (transactionDate > today) {
    return { valid: false, error: 'Transaction date cannot be in the future' };
  }
  return { valid: true };
}

/**
 * Validate envelope exists
 */
export function validateEnvelopeExists(envelopeId: string, envelopes: any[]): { valid: boolean; error?: string } {
  if (!envelopeId) {
    return { valid: false, error: 'Please select an envelope' };
  }
  const exists = envelopes.some((e) => e.id === envelopeId);
  if (!exists) {
    return { valid: false, error: 'Selected envelope does not exist' };
  }
  return { valid: true };
}

/**
 * Validate JSON data structure
 */
export function validateJSONData(jsonString: string): { valid: boolean; error?: string; data?: any } {
  try {
    const data = JSON.parse(jsonString);
    
    // Check if it has required properties
    if (!data.userProfile || !data.settings || !Array.isArray(data.envelopes)) {
      return { valid: false, error: 'Invalid data structure' };
    }

    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

/**
 * Validate all envelope fields together
 */
export function validateEnvelopeForm(
  name: string,
  budget: string,
  openingBalance: string,
  goal: string,
  alertThreshold: string
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const nameValidation = validateEnvelopeName(name);
  if (!nameValidation.valid) errors.name = nameValidation.error || '';

  const budgetValidation = validateBudgetAmount(budget);
  if (!budgetValidation.valid) errors.budget = budgetValidation.error || '';

  if (openingBalance) {
    const obValidation = validateBudgetAmount(openingBalance);
    if (!obValidation.valid) errors.openingBalance = obValidation.error || '';
  }

  if (goal) {
    const goalValidation = validateBudgetAmount(goal);
    if (!goalValidation.valid) errors.goal = goalValidation.error || '';
  }

  const thresholdValidation = validateAlertThreshold(alertThreshold);
  if (!thresholdValidation.valid) errors.alertThreshold = thresholdValidation.error || '';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate all transaction fields together
 */
export function validateTransactionForm(
  amount: string,
  envelopeId: string,
  date: number,
  notes: string,
  envelopes: any[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const amountValidation = validateTransactionAmount(amount);
  if (!amountValidation.valid) errors.amount = amountValidation.error || '';

  const envelopeValidation = validateEnvelopeExists(envelopeId, envelopes);
  if (!envelopeValidation.valid) errors.envelope = envelopeValidation.error || '';

  const dateValidation = validateTransactionDate(date);
  if (!dateValidation.valid) errors.date = dateValidation.error || '';

  const notesValidation = validateTransactionNotes(notes);
  if (!notesValidation.valid) errors.notes = notesValidation.error || '';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
