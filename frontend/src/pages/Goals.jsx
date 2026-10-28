import React, { useEffect, useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  PiggyBank,
  CheckCircle,
  X,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Goal Form
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    deadline: '',
  });

  const [availableBalance, setAvailableBalance] = useState(0);
  const [totalContributions, setTotalContributions] = useState(0);

  // Edit Goal Modal State
  const [editingGoal, setEditingGoal] = useState(null);

  // Add Funds Modal State
  const [fundModalGoal, setFundModalGoal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  const { formatCurrency } = useAuth();

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      if (res.data && Array.isArray(res.data.goals)) {
        setGoals(res.data.goals);
        setAvailableBalance(res.data.availableBalance ?? 0);
        setTotalContributions(res.data.totalContributions ?? 0);
      } else if (Array.isArray(res.data)) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const createGoal = async (e) => {
    e.preventDefault();
    const initSaved = Number(form.savedAmount || 0);
    if (initSaved > availableBalance) {
      alert(`Initial deposit of ${formatCurrency(initSaved)} exceeds your available liquid balance of ${formatCurrency(availableBalance)}.`);
      return;
    }
    try {
      await api.post('/goals', {
        ...form,
        targetAmount: Number(form.targetAmount),
        savedAmount: initSaved,
        deadline: form.deadline || undefined,
      });

      setForm({ name: '', targetAmount: '', savedAmount: '', deadline: '' });
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const updateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      await api.put(`/goals/${editingGoal._id}`, {
        name: editingGoal.name,
        targetAmount: Number(editingGoal.targetAmount),
        deadline: editingGoal.deadline || undefined,
      });
      setEditingGoal(null);
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update goal');
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!fundModalGoal || !fundAmount) return;
    const contributeNum = Number(fundAmount);
    if (contributeNum <= 0) {
      alert('Please enter a positive contribution amount');
      return;
    }
    if (contributeNum > availableBalance) {
      alert(`Contribution of ${formatCurrency(contributeNum)} exceeds your available liquid balance of ${formatCurrency(availableBalance)}.`);
      return;
    }
    try {
      await api.post(`/goals/${fundModalGoal._id}/contribute`, {
        amount: contributeNum,
      });
      setFundModalGoal(null);
      setFundAmount('');
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add savings funds');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal? Any allocated contributions will be returned to your available balance.')) return;
    try {
      await api.delete(`/goals/${id}`);
      loadGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  // Overall Goal Metrics
  const totalTarget = (goals || []).reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = (goals || []).reduce((s, g) => s + g.savedAmount, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="page goals-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">WEALTH & OBJECTIVES</div>
          <h2>Financial Savings Goals</h2>
          <p>Commit to major milestones, allocate real cash from available balance, and celebrate achievements.</p>
        </div>
      </div>

      {/* OVERALL METRICS BANNER */}
      <div className="filtered-summary-banner">
        <div className="summary-pill">
          <span className="summary-pill-label">Available to Allocate:</span>
          <span className="summary-pill-val income">{formatCurrency(availableBalance)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Total Targeted:</span>
          <span className="summary-pill-val">{formatCurrency(totalTarget)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Total Allocated:</span>
          <span className="summary-pill-val gold-text">{formatCurrency(totalSaved)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Remaining to Goal:</span>
          <span className="summary-pill-val">{formatCurrency(Math.max(totalTarget - totalSaved, 0))}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Overall Progress:</span>
          <span className="summary-pill-val">{overallPercentage}%</span>
        </div>
      </div>

      <div className="two-col-layout">
        {/* NEW GOAL FORM */}
        <div className="panel form-panel">
          <div className="panel-title">
            <div>
              <h3>Establish New Goal</h3>
              <p className="muted">Define target, starting savings, and target deadline</p>
            </div>
          </div>

          <form onSubmit={createGoal} className="goal-form">
            <div className="form-field">
              <label>Goal Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. New Laptop, Emergency Fund, Bali Trip"
              />
            </div>

            <div className="form-field">
              <label>Target Amount (₹) *</label>
              <input
                required
                type="number"
                min="100"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                placeholder="e.g. 80000"
              />
            </div>

            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Initial Savings Deposited (₹)</label>
                <small className="muted">Available: <span className="income-text">{formatCurrency(availableBalance)}</span></small>
              </div>
              <input
                type="number"
                min="0"
                value={form.savedAmount}
                onChange={(e) => setForm({ ...form, savedAmount: e.target.value })}
                placeholder="0"
              />
              {Number(form.savedAmount || 0) > availableBalance && (
                <small style={{ color: 'var(--red)', marginTop: 4, display: 'block' }}>
                  Initial deposit exceeds available balance of {formatCurrency(availableBalance)}
                </small>
              )}
            </div>

            <div className="form-field">
              <label>Target Deadline (Optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            <button className="primary-btn submit-btn" type="submit">
              <Plus size={16} /> Create Goal
            </button>
          </form>
        </div>

        {/* GOALS CARDS LIST */}
        <div className="goals-cards-grid">
          {goals.map((g) => {
            const pct = Math.min(100, (g.savedAmount / g.targetAmount) * 100);
            const isCompleted = g.savedAmount >= g.targetAmount;

            return (
              <div className={`panel goal-card-item ${isCompleted ? 'goal-achieved' : ''}`} key={g._id}>
                <div className="goal-card-head">
                  <div className="goal-identity">
                    <div className="goal-icon-badge">
                      {isCompleted ? <CheckCircle size={18} /> : <Target size={18} />}
                    </div>
                    <div>
                      <h4 className="goal-name-heading">{g.name}</h4>
                      <span className="goal-deadline-tag">
                        {g.deadline ? (
                          <>
                            <Calendar size={12} /> Target:{' '}
                            {new Date(g.deadline).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </>
                        ) : (
                          'No strict deadline'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="goal-card-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => setEditingGoal(g)}
                      title="Edit Goal"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={() => deleteGoal(g._id)}
                      title="Delete Goal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="goal-amounts-row">
                  <div className="saved-col">
                    <span className="amt-label">Saved</span>
                    <strong className="amt-val income-text">{formatCurrency(g.savedAmount)}</strong>
                  </div>
                  <div className="target-col">
                    <span className="amt-label">Target</span>
                    <strong className="amt-val">{formatCurrency(g.targetAmount)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-wrap">
                  <div
                    className={`progress-fill ${isCompleted ? 'fill-good' : 'fill-gold'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="goal-card-footer">
                  <span className="pct-complete-badge">
                    {pct.toFixed(1)}% complete
                  </span>
                  <span className="remaining-text">
                    {isCompleted
                      ? 'Goal Fully Achieved! 🎉'
                      : `${formatCurrency(g.remaining)} to go`}
                  </span>
                </div>

                {/* Quick Add Funds Button */}
                <div className="goal-card-cta">
                  <button
                    className="secondary-btn btn-sm full"
                    onClick={() => {
                      setFundModalGoal(g);
                      setFundAmount('');
                    }}
                  >
                    <PiggyBank size={15} />
                    <span>Deposit Savings</span>
                  </button>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && !loading && (
            <div className="panel empty-state-panel full-col">
              <Target size={32} className="empty-icon" />
              <p>No financial goals set yet.</p>
              <small className="muted">
                Create a goal (e.g. New Laptop ₹80,000, Emergency Fund ₹50,000) to track dedicated savings.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* QUICK DEPOSIT SAVINGS MODAL */}
      {fundModalGoal && (
        <div className="modal-backdrop" onClick={() => setFundModalGoal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deposit Savings to "{fundModalGoal.name}"</h3>
              <button className="icon-close-btn" onClick={() => setFundModalGoal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="modal-form-body">
              <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--panel2)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: 6 }}>
                  <span className="muted">Target Progress:</span>
                  <b>{formatCurrency(fundModalGoal.savedAmount)} / {formatCurrency(fundModalGoal.targetAmount)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="muted">Liquid Available Balance:</span>
                  <b className="income-text">{formatCurrency(availableBalance)}</b>
                </div>
              </div>

              <div className="quick-amount-chips">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className="chip-btn"
                    onClick={() => setFundAmount(amt.toString())}
                  >
                    +₹{amt}
                  </button>
                ))}
                {availableBalance > 0 && (
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      const needed = Math.max(fundModalGoal.targetAmount - fundModalGoal.savedAmount, 0);
                      const maxDeposit = needed > 0 ? Math.min(needed, availableBalance) : availableBalance;
                      setFundAmount(maxDeposit.toString());
                    }}
                  >
                    Max ({formatCurrency(Math.min(Math.max(fundModalGoal.targetAmount - fundModalGoal.savedAmount, 0) || availableBalance, availableBalance))})
                  </button>
                )}
              </div>

              <div className="form-field">
                <label>Deposit Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount to contribute"
                  autoFocus
                />
                {Number(fundAmount) > availableBalance && (
                  <small style={{ color: 'var(--red)', marginTop: 4, display: 'block' }}>
                    Deposit amount exceeds your liquid available balance of {formatCurrency(availableBalance)}.
                  </small>
                )}
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setFundModalGoal(null)}
                >
                  Cancel
                </button>
                <button className="primary-btn submit-btn" type="submit">
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GOAL MODAL */}
      {editingGoal && (
        <div className="modal-backdrop" onClick={() => setEditingGoal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Goal: {editingGoal.name}</h3>
              <button className="icon-close-btn" onClick={() => setEditingGoal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={updateGoal} className="modal-form-body">
              <div className="form-field">
                <label>Goal Name</label>
                <input
                  required
                  type="text"
                  value={editingGoal.name}
                  onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Target Amount (₹)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={editingGoal.targetAmount}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, targetAmount: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Saved Amount (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={editingGoal.savedAmount}
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, savedAmount: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Deadline</label>
                <input
                  type="date"
                  value={
                    editingGoal.deadline
                      ? new Date(editingGoal.deadline).toISOString().slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    setEditingGoal({ ...editingGoal, deadline: e.target.value })
                  }
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setEditingGoal(null)}
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
