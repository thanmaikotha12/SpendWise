import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Calendar,
  Download,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { ALL_TRANSACTION_CATEGORIES } from '../constants/categories.js';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & form state
  const [showModal, setShowModal] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState('expense');
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { formatCurrency } = useAuth();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const openAddModal = (typeToOpen) => {
    setEditingTransaction(null);
    setModalDefaultType(typeToOpen);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // Robust, inclusive client-side filtering and sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'All' && t.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        // Search text (title, description, category, paymentMethod)
        if (search.trim()) {
          const s = search.toLowerCase();
          const matchTitle = t.title?.toLowerCase().includes(s);
          const matchDesc = t.description?.toLowerCase().includes(s);
          const matchCat = t.category?.toLowerCase().includes(s);
          const matchMethod = t.paymentMethod?.toLowerCase().includes(s);
          if (!matchTitle && !matchDesc && !matchCat && !matchMethod) return false;
        }

        // Inclusive Date Range filtering
        const tDate = new Date(t.date);
        if (startDate) {
          const sDate = new Date(startDate);
          sDate.setHours(0, 0, 0, 0);
          if (tDate < sDate) return false;
        }
        if (endDate) {
          const eDate = new Date(endDate);
          eDate.setHours(23, 59, 59, 999);
          if (tDate > eDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, search, startDate, endDate, sortBy]);

  // Filtered Totals
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const filteredTransfers = filteredTransactions
    .filter((t) => t.type === 'transfer')
    .reduce((s, t) => s + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense - filteredTransfers;

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date_desc');
  };

  const exportFilteredCSV = () => {
    if (!filteredTransactions.length) return alert('No transactions to export.');
    const headers = ['Title', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Date', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.amount,
      t.paymentMethod || '',
      new Date(t.date).toISOString().slice(0, 10),
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `spendwise_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page transactions-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">MONEY MOVEMENTS</div>
          <h2>Transaction Ledger</h2>
          <p>Record, categorize, filter, and audit every rupee earned and spent.</p>
        </div>

        {/* DISTINCT ACTIONS FOR ADD EXPENSE AND ADD INCOME */}
        <div className="head-actions">
          <button className="secondary-btn" onClick={exportFilteredCSV} title="Export current view to CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="primary-btn expense-btn" onClick={() => openAddModal('expense')}>
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
          <button className="primary-btn income-btn" onClick={() => openAddModal('income')}>
            <Plus size={16} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* FILTERED SUMMARY BANNER */}
      <div className="filtered-summary-banner">
        <div className="summary-pill">
          <span className="summary-pill-label">Filtered Inflow:</span>
          <span className="summary-pill-val income">{formatCurrency(filteredIncome)}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-pill-label">Filtered Outflow:</span>
          <span className="summary-pill-val expense">{formatCurrency(filteredExpense)}</span>
        </div>
        {filteredTransfers > 0 && (
          <div className="summary-pill">
            <span className="summary-pill-label">Goal Allocations:</span>
            <span className="summary-pill-val" style={{ color: 'var(--gold)' }}>
              {formatCurrency(filteredTransfers)}
            </span>
          </div>
        )}
        <div className="summary-pill">
          <span className="summary-pill-label">Net Movement:</span>
          <span className={`summary-pill-val ${filteredNet >= 0 ? 'income' : 'expense'}`}>
            {formatCurrency(filteredNet)}
          </span>
        </div>
        <div className="summary-pill count">
          <span className="summary-pill-label">Records:</span>
          <span className="summary-pill-val">{filteredTransactions.length} of {transactions.length}</span>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="filter-toolbar panel">
        <div className="search-box-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, notes, or payment method…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filters-row">
            {/* Type Filter */}
            <div className="filter-select-wrap">
              <label>Type:</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="expense">Expenses Only</option>
                <option value="income">Income Only</option>
                <option value="transfer">Goal Savings Only</option>
              </select>
            </div>

          {/* Category Filter */}
          <div className="filter-select-wrap">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {ALL_TRANSACTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-wrap">
            <label>Sort:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: Highest First</option>
              <option value="amount_asc">Amount: Lowest First</option>
            </select>
          </div>

          {/* Calendar Date Picker: From Date */}
          <div className="filter-select-wrap">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Filter from this date"
            />
          </div>

          {/* Calendar Date Picker: To Date */}
          <div className="filter-select-wrap">
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Filter to this date"
            />
          </div>

          {(search || typeFilter !== 'all' || categoryFilter !== 'All' || startDate || endDate) && (
            <button className="text-link reset-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* TRANSACTIONS TABLE PANEL */}
      <div className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Type</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th className="th-right">Amount</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div className="tx-cell-title">
                      <b>{t.title}</b>
                      {t.description && <small className="tx-cell-notes">{t.description}</small>}
                    </div>
                  </td>
                  <td>
                    <span className={`type-tag ${t.type}`}>
                      {t.type === 'income' ? '+ Income' : t.type === 'transfer' ? '⇄ Goal Savings' : '− Expense'}
                    </span>
                  </td>
                  <td>
                    <span className="cat-badge">{t.category}</span>
                  </td>
                  <td>
                    <span className="payment-method-tag">{t.paymentMethod || 'Cash'}</span>
                  </td>
                  <td>
                    <span className="date-cell">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="th-right">
                    <span className={`tx-amount-display ${t.type}`}>
                      {t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄ ' : '−'}
                      {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="th-actions">
                    <div className="action-buttons-wrap">
                      <button
                        className="icon-btn edit-btn"
                        onClick={() => {
                          setEditingTransaction(t);
                          setShowModal(true);
                        }}
                        title="Edit transaction"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => handleDelete(t._id)}
                        title="Delete transaction"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && !loading && (
            <div className="empty-state-panel">
              <p>
                {transactions.length === 0
                  ? 'No transactions recorded yet.'
                  : 'No transactions match the selected filters.'}
              </p>
              {transactions.length === 0 ? (
                <div className="empty-actions-row">
                  <button className="primary-btn btn-sm" onClick={() => openAddModal('expense')}>
                    <Plus size={15} /> Add First Expense
                  </button>
                  <button className="secondary-btn btn-sm" onClick={() => openAddModal('income')}>
                    <Plus size={15} /> Add First Income
                  </button>
                </div>
              ) : (
                <button className="secondary-btn btn-sm" onClick={resetFilters}>
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT TRANSACTION MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingTransaction
                  ? 'Edit Transaction'
                  : modalDefaultType === 'income'
                    ? 'Record Income'
                    : 'Record Expense'}
              </h3>
              <button className="icon-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <TransactionForm
              initialData={editingTransaction}
              defaultType={modalDefaultType}
              onSaved={() => {
                setShowModal(false);
                setEditingTransaction(null);
                loadTransactions();
              }}
              onCancel={() => {
                setShowModal(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
