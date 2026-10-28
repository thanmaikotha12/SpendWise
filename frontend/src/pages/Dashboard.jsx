import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Target,
  PieChart as PieIcon,
  Bell,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Info,
  Calendar,
  ChevronRight,
  X,
  PiggyBank,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { CATEGORY_COLORS } from '../constants/categories.js';

const FALLBACK_COLORS = ['#d4af37', '#e77f79', '#69c48c', '#78a9e8', '#b388ff', '#ffb74d', '#4dd0e1', '#a1887f'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState('expense');

  const { user, formatCurrency, theme } = useAuth();
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, analyticsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/analytics'),
      ]);
      setData(summaryRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openAddModal = (type) => {
    setModalDefaultType(type);
    setShowAddModal(true);
  };

  if (loading && !data) {
    return (
      <div className="page-loading-skeleton">
        <div className="skeleton-card" />
        <div className="skeleton-grid" />
      </div>
    );
  }

  const categoryEntries = data?.categorySpend ? Object.entries(data.categorySpend) : [];
  const topCategories = categoryEntries
    .map(([category, amount]) => ({ name: category, value: amount }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const getInsightIcon = (icon) => {
    switch (icon) {
      case 'trending-up':
        return <TrendingUp size={18} className="insight-icon category" />;
      case 'alert-triangle':
        return <AlertTriangle size={18} className="insight-icon warning" />;
      case 'alert-circle':
        return <AlertCircle size={18} className="insight-icon danger" />;
      case 'shield-check':
        return <ShieldCheck size={18} className="insight-icon positive" />;
      case 'sparkles':
        return <Sparkles size={18} className="insight-icon sparkles" />;
      default:
        return <Info size={18} className="insight-icon neutral" />;
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="page dashboard-page">
      {/* Page Header */}
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">EXECUTIVE FINANCIAL PULSE</div>
          <h2 className="dashboard-main-heading">Financial Command Center</h2>
          <p>Real-time analytics, disciplined budgets, and wealth accumulation tracking.</p>
        </div>

        {/* DISTINCT ACTIONS FOR ADD EXPENSE AND ADD INCOME */}
        <div className="head-actions">
          <button className="primary-btn expense-btn" onClick={() => openAddModal('expense')}>
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
          <button className="primary-btn income-btn" onClick={() => openAddModal('income')}>
            <Plus size={16} />
            <span>Add Income</span>
          </button>
          <button className="secondary-btn" onClick={() => navigate('/budgets')}>
            <PieIcon size={16} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* 4 CORE STAT CARDS WITH AVAILABLE BALANCE */}
      <div className="stat-grid">
        <StatCard
          label="Available Liquid Balance"
          value={data?.availableBalance ?? Math.max(0, (data?.balance || 0) - (data?.totalGoalContributions || 0))}
          icon={Wallet}
          accent="gold"
          sub={`Total Net Worth: ${formatCurrency(data?.balance || 0)}${(data?.totalGoalContributions || 0) > 0 ? ` (${formatCurrency(data.totalGoalContributions)} in Goals)` : ''}`}
        />
        <StatCard
          label="This Month Income"
          value={data?.monthIncome || 0}
          icon={ArrowUpRight}
          accent="green"
          trend={{ type: 'positive', text: 'Cash Inflow' }}
        />
        <StatCard
          label="This Month Expenses"
          value={data?.monthExpense || 0}
          icon={ArrowDownRight}
          accent="red"
          trend={{ type: 'negative', text: 'Cash Outflow' }}
        />
        <StatCard
          label="Net Savings This Month"
          value={data?.monthSavings || 0}
          icon={TrendingUp}
          accent="blue"
          sub={`Savings Rate: ${data?.savingsRate || 0}%`}
        />
      </div>

      {/* CHARTS ROW: INCOME VS EXPENSES & SPENDING BREAKDOWN */}
      <div className="dashboard-charts-grid">
        {/* Monthly Income vs Expense Chart */}
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Income vs Expenses Trend</h3>
              <p className="muted">Past 6 months comparison</p>
            </div>
            <button className="text-link" onClick={() => navigate('/analytics')}>
              Detailed Analytics →
            </button>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 260 }}>
            {analytics?.monthly?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#262a30'} vertical={false} />
                  <XAxis dataKey="label" stroke={isLight ? '#64748b' : '#8b919a'} fontSize={12} />
                  <YAxis
                    stroke={isLight ? '#64748b' : '#8b919a'}
                    fontSize={12}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#ffffff' : '#16181c',
                      borderColor: isLight ? '#e2e8f0' : '#2b2f35',
                      color: isLight ? '#0f172a' : '#f6f2ea',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    itemStyle={{ color: isLight ? '#0f172a' : '#f6f2ea' }}
                    labelStyle={{ color: isLight ? '#0f172a' : '#f6f2ea', fontWeight: 700 }}
                    formatter={(val) => [formatCurrency(val), '']}
                  />
                  <Legend wrapperStyle={{ color: isLight ? '#0f172a' : '#f6f2ea' }} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">Add transactions to generate trend data.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Spending by Category</h3>
              <p className="muted">Current month breakdown</p>
            </div>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 260 }}>
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {topCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#ffffff' : '#16181c',
                      borderColor: isLight ? '#e2e8f0' : '#2b2f35',
                      color: isLight ? '#0f172a' : '#f6f2ea',
                      borderRadius: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    itemStyle={{ color: isLight ? '#0f172a' : '#f6f2ea' }}
                    labelStyle={{ color: isLight ? '#0f172a' : '#f6f2ea', fontWeight: 700 }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                  <Legend wrapperStyle={{ color: isLight ? '#0f172a' : '#f6f2ea' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No expenses recorded this month yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: ACTIVE BUDGETS & FINANCIAL GOALS */}
      <div className="dashboard-two-col">
        {/* Active Budgets Section */}
        <div className="panel">
          <div className="panel-title">
            <div>
              <h3>Monthly Budgets</h3>
              <p className="muted">Category spending limits & usage</p>
            </div>
            <button className="text-link" onClick={() => navigate('/budgets')}>
              Manage Budgets →
            </button>
          </div>

          {data?.budgets?.length > 0 ? (
            <div className="dashboard-budget-list">
              {data.budgets.slice(0, 4).map((b) => {
                const pct = Math.min(100, Math.round(b.percentage));
                const isOver = b.isOverBudget;
                const isNear = pct >= 80 && !isOver;

                return (
                  <div className="budget-item-card" key={b._id}>
                    <div className="budget-item-top">
                      <div className="budget-item-info">
                        <span className="budget-cat-name">{b.category}</span>
                        <span className="budget-values">
                          {formatCurrency(b.spent)} of {formatCurrency(b.amount)}
                        </span>
                      </div>
                      <span className={`budget-status-pill ${isOver ? 'danger' : isNear ? 'warning' : 'good'}`}>
                        {isOver ? `Over by ${formatCurrency(b.spent - b.amount)}` : `${pct}% used`}
                      </span>
                    </div>

                    <div className="progress-bar-wrap">
                      <div
                        className={`progress-fill ${isOver ? 'fill-danger' : isNear ? 'fill-warning' : 'fill-good'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-panel">
              <p>No budgets configured for this month.</p>
              <button className="secondary-btn btn-sm" onClick={() => navigate('/budgets')}>
                Create First Budget
              </button>
            </div>
          )}
        </div>

        {/* Financial Goals Section */}
        <div className="panel">
          <div className="panel-title">
            <div>
              <h3>Savings Goals</h3>
              <p className="muted">Milestone targets & contributions</p>
            </div>
            <button className="text-link" onClick={() => navigate('/goals')}>
              View Goals →
            </button>
          </div>

          {data?.goals?.length > 0 ? (
            <div className="dashboard-goals-list">
              {data.goals.slice(0, 3).map((g) => {
                const pct = Math.round(g.percentage);
                return (
                  <div className="goal-item-card" key={g._id}>
                    <div className="goal-item-top">
                      <div className="goal-title-wrap">
                        <span className="goal-name">{g.name}</span>
                        {g.deadline && (
                          <span className="goal-deadline">
                            <Calendar size={12} />
                            {new Date(g.deadline).toLocaleDateString('en-IN', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <span className="goal-amount-tag">
                        {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
                      </span>
                    </div>

                    <div className="progress-bar-wrap">
                      <div className="progress-fill fill-gold" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="goal-item-footer">
                      <span className="goal-pct">{pct}% completed</span>
                      <span className="goal-remaining">{formatCurrency(g.remaining)} to go</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-panel">
              <p>No active financial goals established.</p>
              <button className="secondary-btn btn-sm" onClick={() => navigate('/goals')}>
                Create Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: RECENT TRANSACTIONS & RULE-BASED INSIGHTS */}
      <div className="dashboard-two-col">
        {/* Recent Transactions List */}
        <div className="panel">
          <div className="panel-title">
            <div>
              <h3>Recent Activity</h3>
              <p className="muted">Latest income & expense movements</p>
            </div>
            <button className="text-link" onClick={() => navigate('/transactions')}>
              All Transactions →
            </button>
          </div>

          {data?.recent?.length > 0 ? (
            <div className="recent-tx-list">
              {data.recent.map((t) => (
                <div className="tx-row" key={t._id}>
                  <div className={`tx-icon ${t.type}`}>
                    {t.type === 'income' ? <ArrowUpRight size={16} /> : t.type === 'transfer' ? <PiggyBank size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="tx-details">
                    <span className="tx-title">{t.title}</span>
                    <span className="tx-meta">
                      {t.category} • {t.paymentMethod} •{' '}
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className={`tx-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄ ' : '−'}
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-panel">
              <p>No transactions recorded yet.</p>
              <div className="empty-actions-row">
                <button className="primary-btn btn-sm" onClick={() => openAddModal('expense')}>
                  Add Expense
                </button>
                <button className="secondary-btn btn-sm" onClick={() => openAddModal('income')}>
                  Add Income
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Financial Insights & Notifications Preview */}
        <div className="panel">
          <div className="panel-title">
            <div>
              <h3>Rule-Based Financial Insights</h3>
              <p className="muted">Deterministic analysis derived from your transaction history</p>
            </div>
            <button className="text-link" onClick={() => navigate('/assistant')}>
              Ask AI Assistant →
            </button>
          </div>

          {data?.insights?.length > 0 ? (
            <div className="insights-container">
              {data.insights.map((ins, i) => (
                <div className={`insight-card ${ins.type}`} key={i}>
                  <div className="insight-header">
                    {getInsightIcon(ins.icon)}
                    <span className="insight-title">{ins.title}</span>
                  </div>
                  <p className="insight-desc">{ins.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-panel">
              <p>Record transactions to generate personalized financial insights.</p>
            </div>
          )}

          {/* Quick Notifications Preview */}
          {data?.notifications?.length > 0 && (
            <div className="notif-preview-box">
              <div className="notif-preview-header">
                <div className="preview-label">
                  <Bell size={14} />
                  <span>Recent Notifications</span>
                </div>
                <button className="text-link" onClick={() => navigate('/notifications')}>
                  View all ({data.unreadCount || 0} unread)
                </button>
              </div>
              <div className="preview-item">
                <span className="preview-notif-title">{data.notifications[0].title}</span>
                <span className="preview-notif-msg">{data.notifications[0].message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ADD TRANSACTION MODAL (PRE-CONFIGURED FOR EXPENSE OR INCOME) */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalDefaultType === 'income' ? 'Record Income' : 'Record Expense'}</h3>
              <button className="icon-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <TransactionForm
              defaultType={modalDefaultType}
              onSaved={() => {
                setShowAddModal(false);
                loadDashboardData();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
