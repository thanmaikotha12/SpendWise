import React, { useEffect, useState } from 'react';
import {
  Repeat2,
  Trash2,
  Edit2,
  Play,
  Calendar,
  AlertCircle,
  Plus,
  X,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EXPENSE_CATEGORIES } from '../constants/categories.js';

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];
const PAYMENT_METHODS = ['Auto Debit', 'UPI', 'Card', 'Bank Transfer', 'Cash'];

export default function Recurring() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0] || 'Bills & Utilities',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Auto Debit',
  });

  const [editingItem, setEditingItem] = useState(null);
  const [processMessage, setProcessMessage] = useState('');

  const { formatCurrency } = useAuth();

  const loadRecurring = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recurring');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load recurring expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecurring();
  }, []);

  const saveRecurring = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recurring', {
        ...form,
        amount: Number(form.amount),
        nextDueDate: new Date(form.nextDueDate),
      });

      setForm({
        title: '',
        amount: '',
        category: 'Bills',
        frequency: 'monthly',
        nextDueDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'Auto Debit',
      });
      loadRecurring();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save recurring item');
    }
  };

  const updateRecurring = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      await api.put(`/recurring/${editingItem._id}`, {
        title: editingItem.title,
        amount: Number(editingItem.amount),
        category: editingItem.category,
        frequency: editingItem.frequency,
        paymentMethod: editingItem.paymentMethod,
        nextDueDate: new Date(editingItem.nextDueDate),
      });
      setEditingItem(null);
      loadRecurring();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update recurring expense');
    }
  };

  const removeRecurring = async (id) => {
    if (!window.confirm('Delete this recurring expense?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      loadRecurring();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const processDueExpenses = async () => {
    try {
      const res = await api.post('/recurring/process-due');
      setProcessMessage(res.data.message);
      loadRecurring();
      setTimeout(() => setProcessMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process due recurring items');
    }
  };

  // Calculate monthly commitment approximation
  const totalMonthlyCommitment = items.reduce((sum, item) => {
    if (!item.active) return sum;
    if (item.frequency === 'daily') return sum + item.amount * 30;
    if (item.frequency === 'weekly') return sum + item.amount * 4;
    if (item.frequency === 'yearly') return sum + item.amount / 12;
    return sum + item.amount; // default monthly
  }, 0);

  const getDueStatus = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', type: 'danger' };
    if (diffDays === 0) return { text: 'Due Today', type: 'danger' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} day(s)`, type: 'warning' };
    return { text: `Due in ${diffDays} days`, type: 'neutral' };
  };

  return (
    <div className="page recurring-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">AUTOMATE & FORECAST</div>
          <h2>Recurring Expenses & Bills</h2>
          <p>Organize subscriptions, rent, and utility commitments with automatic transaction processing.</p>
        </div>

        <div className="head-actions">
          <button className="primary-btn" onClick={processDueExpenses}>
            <Play size={16} />
            <span>Process Due Bills</span>
          </button>
        </div>
      </div>

      {processMessage && (
        <div className="form-feedback-message success" style={{ marginBottom: 20 }}>
          <CheckCircle size={16} /> {processMessage}
        </div>
      )}

      {/* RECURRING COMMITMENT BANNER */}
      <div className="filtered-summary-banner">
        <div className="summary-pill">
          <span className="summary-pill-label">Monthly Bill Commitment:</span>
          <span className="summary-pill-val expense">{formatCurrency(totalMonthlyCommitment)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Active Subscriptions:</span>
          <span className="summary-pill-val">{items.length} services</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Status:</span>
          <span className="summary-pill-val income">Auto-tracking active</span>
        </div>
      </div>

      <div className="two-col-layout">
        {/* ADD RECURRING FORM */}
        <div className="panel form-panel">
          <div className="panel-title">
            <div>
              <h3>Add Recurring Bill</h3>
              <p className="muted">Store repeating subscriptions or monthly obligations</p>
            </div>
          </div>

          <form onSubmit={saveRecurring} className="recurring-form">
            <div className="form-field">
              <label>Bill / Service Title *</label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Netflix, Broadband, House Rent, Gym"
              />
            </div>

            <div className="form-field">
              <label>Amount (₹) *</label>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 649"
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select
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
              <label>Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Next Due Date *</label>
              <input
                required
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
              />
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

            <button className="primary-btn submit-btn" type="submit">
              <Plus size={16} /> Save Recurring Bill
            </button>
          </form>
        </div>

        {/* RECURRING EXPENSES LIST */}
        <div className="recurring-cards-list">
          {items.map((r) => {
            const dueStatus = getDueStatus(r.nextDueDate);

            return (
              <div className="panel recurring-item-card" key={r._id}>
                <div className="rec-card-main">
                  <div className="rec-icon-box">
                    <Repeat2 size={20} />
                  </div>

                  <div className="rec-details">
                    <div className="rec-title-row">
                      <span className="rec-title">{r.title}</span>
                      <span className="rec-cat-tag">{r.category}</span>
                      <span className="rec-freq-pill">{r.frequency}</span>
                    </div>

                    <div className="rec-meta-row">
                      <span>
                        <CreditCard size={13} /> {r.paymentMethod || 'Auto Debit'}
                      </span>
                      <span>
                        <Calendar size={13} /> Next Due:{' '}
                        {new Date(r.nextDueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className={`due-status-badge ${dueStatus.type}`}>
                        {dueStatus.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rec-card-right">
                  <div className="rec-amount-val expense-text">
                    {formatCurrency(r.amount)}
                  </div>
                  <div className="rec-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => setEditingItem(r)}
                      title="Edit recurring item"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => removeRecurring(r._id)}
                      title="Delete recurring item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && !loading && (
            <div className="panel empty-state-panel full-col">
              <Repeat2 size={32} className="empty-icon" />
              <p>No recurring subscriptions logged.</p>
              <small className="muted">
                Add subscriptions like Netflix, Spotify, Internet, or Rent to forecast monthly fixed commitments.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* EDIT RECURRING MODAL */}
      {editingItem && (
        <div className="modal-backdrop" onClick={() => setEditingItem(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Recurring: {editingItem.title}</h3>
              <button className="icon-close-btn" onClick={() => setEditingItem(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={updateRecurring} className="modal-form-body">
              <div className="form-field">
                <label>Title</label>
                <input
                  required
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Amount (₹)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingItem.amount}
                  onChange={(e) => setEditingItem({ ...editingItem, amount: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Category</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Frequency</label>
                <select
                  value={editingItem.frequency}
                  onChange={(e) => setEditingItem({ ...editingItem, frequency: e.target.value })}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Next Due Date</label>
                <input
                  type="date"
                  value={
                    editingItem.nextDueDate
                      ? new Date(editingItem.nextDueDate).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, nextDueDate: e.target.value })
                  }
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </button>
                <button className="primary-btn submit-btn" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
