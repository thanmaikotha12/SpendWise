/**
 * Centralized Categories for SpendWise Backend
 */

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Gift',
  'Other',
];

export const ALL_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES.filter((c) => !EXPENSE_CATEGORIES.includes(c)),
];

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Card',
  'Bank Transfer',
  'Auto Debit',
  'Other',
];
