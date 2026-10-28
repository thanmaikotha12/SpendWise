import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Plus, AlertTriangle, CheckCircle2, AlertOctagon, Calendar, PieChart } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
  });

  const [editingBudget, setEditingBudget] = useState(null);
  const [message, setMessage] = useState('');

  const { formatCurrency } = useAuth();

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${month}&year=${year}`);
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  const saveBudget = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, {
          amount: Number(form.amount),
          category: form.category,
        });
        setMessage('Budget limit updated successfully!');
        setEditingBudget(null);
      } else {
        await api.post('/budgets', {
          category: form.category,
          amount: Number(form.amount),
          month: Number(month),
          year: Number(year),
        });
        setMessage('Budget configured successfully!');
      }

      setForm({ category: EXPENSE_CATEGORIES[0], amount: '' });
      loadBudgets();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleEditClick = (b) => {
    setEditingBudget(b);
    setForm({
      category: b.category,
      amount: b.amount,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingBudget(null);
    setForm({ category: EXPENSE_CATEGORIES[0], amount: '' });
  };

  const removeBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      loadBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  // Aggregated summary
  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalRemaining = Math.max(totalBudgeted - totalSpent, 0);
  const totalUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="page budgets-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">DISCIPLINED ALLOCATION</div>
          <h2>Monthly Budgets</h2>
          <p>Establish strict spending guardrails per category and monitor threshold consumption.</p>
        </div>

        {/* Month/Year selector */}
        <div className="period-selector">
          <div className="select-pill">
            <Calendar size={15} />
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
          </div>
          <div className="select-pill">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* OVERALL BUDGET UTILIZATION STATS BANNER */}
      <div className="filtered-summary-banner">
        <div className="summary-pill">
          <span className="summary-pill-label">Total Allocated:</span>
          <span className="summary-pill-val">{formatCurrency(totalBudgeted)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Actual Spent:</span>
          <span className="summary-pill-val expense">{formatCurrency(totalSpent)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Remaining Buffer:</span>
          <span className="summary-pill-val income">{formatCurrency(totalRemaining)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Overall Usage:</span>
          <span className={`summary-pill-val ${totalUtilization > 100 ? 'expense' : 'income'}`}>
            {totalUtilization}%
          </span>
        </div>
      </div>

      <div className="two-col-layout">
        {/* BUDGET CREATION / EDIT FORM */}
        <div className="panel form-panel">
          <div className="panel-title">
            <div>
              <h3>{editingBudget ? 'Edit Category Budget' : 'Configure New Budget'}</h3>
              <p className="muted">Set maximum monthly ceiling for a specific category</p>
            </div>
          </div>

          <form onSubmit={saveBudget} className="budget-form">
            <div className="form-field">
              <label>Spending Category</label>
              <select
                disabled={Boolean(editingBudget)}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Monthly Limit (₹)</label>
              <input
                required
                type="number"
                min="10"
                step="10"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 5000"
              />
            </div>

            {message && <div className="form-feedback-message success">{message}</div>}

            <div className="form-actions-row">
              {editingBudget && (
                <button type="button" className="secondary-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
              <button className="primary-btn submit-btn" type="submit">
                {editingBudget ? 'Save Changes' : 'Create Budget'}
              </button>
            </div>
          </form>
        </div>

        {/* BUDGET CARDS LIST */}
        <div className="budget-cards-grid">
          {budgets.map((b) => {
            const pct = Math.round(b.percentage);
            const isExceeded = b.isOverBudget;
            const isNear = pct >= 80 && !isExceeded;

            return (
              <div
                className={`panel budget-card-item ${isExceeded ? 'border-danger' : isNear ? 'border-warning' : ''}`}
                key={b._id}
              >
                <div className="budget-card-head">
                  <div className="budget-card-title-group">
                    <span className="budget-cat-badge">{b.category}</span>
                    <span className="budget-sub-date">
                      {new Date(year, month - 1).toLocaleString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="budget-card-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => handleEditClick(b)}
                      title="Edit budget amount"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => removeBudget(b._id)}
                      title="Delete budget"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="budget-card-numbers">
                  <div className="b-spent-label">
                    <span>Spent:</span>
                    <strong className={isExceeded ? 'expense-text' : ''}>
                      {formatCurrency(b.spent)}
                    </strong>
                  </div>
                  <div className="b-limit-label">
                    <span>Limit:</span>
                    <strong>{formatCurrency(b.amount)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-wrap">
                  <div
                    className={`progress-fill ${isExceeded ? 'fill-danger' : isNear ? 'fill-warning' : 'fill-good'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="budget-card-footer">
                  <div className="usage-indicator">
                    {isExceeded ? (
                      <span className="indicator-tag tag-danger">
                        <AlertOctagon size={13} /> Exceeded by {formatCurrency(b.excess)}
                      </span>
                    ) : isNear ? (
                      <span className="indicator-tag tag-warning">
                        <AlertTriangle size={13} /> {pct}% used ({formatCurrency(b.remaining)} left)
                      </span>
                    ) : (
                      <span className="indicator-tag tag-good">
                        <CheckCircle2 size={13} /> {pct}% used ({formatCurrency(b.remaining)} left)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {budgets.length === 0 && !loading && (
            <div className="panel empty-state-panel full-col">
              <PieChart size={32} className="empty-icon" />
              <p>No budgets established for this month.</p>
              <small className="muted">
                Create category limits above (e.g. Food ₹5,000, Transport ₹2,000) to receive smart threshold alerts.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
