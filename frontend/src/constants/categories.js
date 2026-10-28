/**
 * Centralized SpendWise Category and Payment Method Configuration
 * Used consistently across Transactions, Budgets, Recurring Expenses, Analytics, Reports, and AI Assistant
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

export const ALL_TRANSACTION_CATEGORIES = [
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

export const RECURRING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const CATEGORY_COLORS = {
  Food: '#eab308',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#a855f7',
  Health: '#10b981',
  Education: '#06b6d4',
  Travel: '#f97316',
  Salary: '#22c55e',
  Freelance: '#14b8a6',
  Gift: '#8b5cf6',
  Other: '#64748b',
};
