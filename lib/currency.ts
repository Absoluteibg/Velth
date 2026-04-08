/**
 * Currency utilities for Velth
 * Handles currency formatting and symbols
 */

import { CurrencyCode } from './types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
};

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted string like "₹1,234.56"
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format amount without currency symbol
 * @param amount - The amount to format
 * @returns Formatted string like "1,234.56"
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Get currency symbol
 * @param currency - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Get currency name
 * @param currency - The currency code
 * @returns Currency name
 */
export function getCurrencyName(currency: CurrencyCode): string {
  return CURRENCY_NAMES[currency];
}
