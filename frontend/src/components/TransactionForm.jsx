import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../constants/categories.js';

export default function TransactionForm({
  onSaved,
  initialData = null,
  defaultType = 'expense',
  onCancel,
}) {
  const isEdit = Boolean(initialData?._id);

  const [type, setType] = useState(initialData?.type || defaultType);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    amount: initialData?.amount || '',
    category:
      initialData?.category ||
      (defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
    paymentMethod: initialData?.paymentMethod || 'UPI',
    date: initialData?.date
      ? new Date(initialData.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    description: initialData?.description || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setForm({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category:
          initialData.category ||
          (initialData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        paymentMethod: initialData.paymentMethod || 'UPI',
        date: initialData.date
          ? new Date(initialData.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        description: initialData.description || '',
      });
    } else if (defaultType) {
      setType(defaultType);
      setForm((prev) => ({
        ...prev,
        category: defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
      }));
    }
  }, [initialData, defaultType]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income' && !INCOME_CATEGORIES.includes(form.category)) {
      setForm((prev) => ({ ...prev, category: INCOME_CATEGORIES[0] }));
    } else if (newType === 'expense' && !EXPENSE_CATEGORIES.includes(form.category)) {
      setForm((prev) => ({ ...prev, category: EXPENSE_CATEGORIES[0] }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        ...form,
        type,
        amount: Number(form.amount),
        date: new Date(form.date),
      };

      if (isEdit) {
        await api.put(`/transactions/${initialData._id}`, payload);
        setMessage({ text: 'Transaction updated successfully!', type: 'success' });
      } else {
        await api.post('/transactions', payload);
        setMessage({ text: 'Transaction saved successfully!', type: 'success' });
        // Reset form for next entry
        setForm({
          title: '',
          amount: '',
          category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
          paymentMethod: 'UPI',
          date: new Date().toISOString().slice(0, 10),
          description: '',
        });
      }

      if (onSaved) onSaved();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Error saving transaction',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form className="transaction-form-card" onSubmit={submit}>
      {/* Type Toggle: Expense vs Income */}
      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => handleTypeChange('expense')}
        >
          − Expense
        </button>
        <button
          type="button"
          className={`segment-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => handleTypeChange('income')}
        >
          + Income
        </button>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label>Title / Merchant *</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={type === 'expense' ? 'e.g. Swiggy, Groceries, Electricity' : 'e.g. Monthly Salary, Freelance project'}
          />
        </div>

        <div className="form-field">
          <label>Amount (₹) *</label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div className="form-field">
          <label>Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {currentCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Payment Method</label>
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Date (Calendar)</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div className="form-field wide">
          <label>Notes / Description (Optional)</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Additional context or invoice ref"
          />
        </div>
      </div>

      {message.text && (
        <div className={`form-feedback-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-actions-row">
        {onCancel && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="primary-btn submit-btn" disabled={loading} type="submit">
          {loading ? 'Saving…' : isEdit ? 'Update Transaction' : `Record ${type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </div>
    </form>
  );
}
