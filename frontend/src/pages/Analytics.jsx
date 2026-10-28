import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatCard from '../components/StatCard.jsx';

const PIE_COLORS = ['#d4af37', '#e77f79', '#69c48c', '#78a9e8', '#b388ff', '#ffb74d', '#4dd0e1', '#a1887f'];

export default function Analytics() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState({
    monthly: [],
    categories: [],
    budgetUtilization: [],
    totalIncome: 0,
    totalExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  const { formatCurrency, theme } = useAuth();
  const isLight = theme === 'light';

  const tooltipStyle = {
    backgroundColor: isLight ? '#ffffff' : '#16181c',
    borderColor: isLight ? '#cbd5e1' : '#2b2f35',
    color: isLight ? '#0f172a' : '#f6f2ea',
    borderRadius: 10,
    boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.1)' : '0 4px 16px rgba(0,0,0,0.4)',
  };
  const itemStyle = {
    color: isLight ? '#0f172a' : '#f6f2ea',
    fontWeight: 600,
  };
  const gridColor = isLight ? '#e2e8f0' : '#262a30';
  const axisColor = isLight ? '#64748b' : '#8b919a';

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/analytics?month=${month}&year=${year}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [month, year]);

  const netSavings = (data.totalIncome || 0) - (data.totalExpense || 0);
  const totalTransfers = data.totalTransfers || 0;
  const availableSavings = Math.max(0, netSavings - totalTransfers);
  const savingsRate =
    data.totalIncome > 0 ? Math.round((netSavings / data.totalIncome) * 100) : 0;
  const topCategory = data.categories?.[0] || null;

  return (
    <div className="page analytics-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">DATA INTELLIGENCE</div>
          <h2>Financial Analytics & Trends</h2>
          <p>Multi-dimensional analysis of cash flows, category allocations, and wealth accumulation patterns.</p>
        </div>

        {/* Period Selector Controls */}
        <div className="head-actions">
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
      </div>

      {/* 4 SUMMARY STAT CARDS */}
      <div className="stat-grid">
        <StatCard
          label="Cumulative Inflows"
          value={data.totalIncome}
          icon={ArrowUpRight}
          accent="green"
        />
        <StatCard
          label="Cumulative Outflows"
          value={data.totalExpense}
          icon={ArrowDownRight}
          accent="red"
        />
        <StatCard
          label="Cumulative Net Available"
          value={availableSavings}
          icon={TrendingUp}
          accent="gold"
          sub={`Total Net: ${formatCurrency(netSavings)}${totalTransfers > 0 ? ` (${formatCurrency(totalTransfers)} in Goals)` : ''} • Rate: ${savingsRate}%`}
        />
        <div className="stat-card blue">
          <div className="stat-card-header">
            <div className="stat-icon">
              <PieIcon size={20} />
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-label">Top Expense Category</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {topCategory ? topCategory.category : 'None'}
            </div>
            {topCategory && (
              <div className="stat-sub">
                {formatCurrency(topCategory.amount)} ({topCategory.percentage}% of total spend)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 1: INCOME VS EXPENSES & SPENDING BY CATEGORY */}
      <div className="dashboard-charts-grid">
        {/* Income vs Expenses Trend */}
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Income vs Expenses (Monthly)</h3>
              <p className="muted">Direct monthly cash inflow vs outflow comparison</p>
            </div>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 280 }}>
            {data.monthly?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={12}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={itemStyle}
                    formatter={(val) => [formatCurrency(val), '']}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#69c48c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#e77f79" radius={[4, 4, 0, 0]} />
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
              <h3>Category Expenditure Breakdown</h3>
              <p className="muted">Percentage distribution of all recorded expenses</p>
            </div>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 280 }}>
            {data.categories?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {data.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={itemStyle}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No expenses recorded yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 2: MONTHLY SAVINGS TREND & BUDGET UTILIZATION */}
      <div className="dashboard-charts-grid">
        {/* Monthly Net Savings Area Trend */}
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Monthly Savings Accumulation Trend</h3>
              <p className="muted">Net cash retained month-over-month</p>
            </div>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 280 }}>
            {data.monthly?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                  <YAxis
                    stroke={axisColor}
                    fontSize={12}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={itemStyle}
                    formatter={(val) => [formatCurrency(val), 'Net Savings']}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    name="Net Savings"
                    stroke="#d4af37"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#savingsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No savings trend data available.</div>
            )}
          </div>
        </div>

        {/* Budget Utilization Comparison Bar */}
        <div className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>Current Month Budget Utilization</h3>
              <p className="muted">Actual spend vs configured budget limit</p>
            </div>
          </div>

          <div className="chart-container" style={{ width: '100%', height: 280 }}>
            {data.budgetUtilization?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.budgetUtilization}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={axisColor}
                    fontSize={12}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke={axisColor}
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={itemStyle}
                    formatter={(val) => [formatCurrency(val), '']}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget Limit" fill={isLight ? '#cbd5e1' : '#3a4049'} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" name="Actual Spent" fill="#d4af37" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">Configure budgets to view utilization metrics.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
