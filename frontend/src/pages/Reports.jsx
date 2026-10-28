import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const { formatCurrency, user } = useAuth();

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/reports?month=${month}&year=${year}`);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [month, year]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csv = `SPENDWISE FINANCIAL REPORT - ${report.monthName}\n`;
    csv += `Generated for: ${user?.name || 'User'}\n\n`;
    csv += `EXECUTIVE SUMMARY\n`;
    csv += `Total Inflow,${report.totalIncome}\n`;
    csv += `Total Outflow,${report.totalExpense}\n`;
    csv += `Allocated to Goals,${report.totalTransfers || 0}\n`;
    csv += `Net Available Savings,${report.availableSavings ?? (report.netSavings - (report.totalTransfers || 0))}\n`;
    csv += `Savings Rate,${report.savingsRate}%\n\n`;

    csv += `CATEGORY EXPENDITURE\n`;
    csv += `Category,Amount (INR),Share (%)\n`;
    report.categories?.forEach((c) => {
      csv += `"${c.category}",${c.amount},${c.percentage}%\n`;
    });
    csv += `\n`;

    csv += `BUDGET PERFORMANCE\n`;
    csv += `Category,Budget Limit,Actual Spent,Variance,Percentage\n`;
    report.budgetReport?.forEach((b) => {
      csv += `"${b.category}",${b.budget},${b.spent},${b.variance},${b.percentage}%\n`;
    });
    csv += `\n`;

    csv += `DETAILED TRANSACTIONS\n`;
    csv += `Title,Type,Category,Amount,Date,Payment Method,Notes\n`;
    report.transactions?.forEach((t) => {
      csv += `"${t.title.replace(/"/g, '""')}",${t.type},${t.category},${t.amount},${new Date(
        t.date
      )
        .toISOString()
        .slice(0, 10)},${t.paymentMethod || 'Cash'},"${(t.description || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendWise_Report_${year}_${String(month).padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page reports-page">
      {/* Page Header */}
      <div className="page-head no-print">
        <div>
          <div className="eyebrow">AUDIT & EXPORT</div>
          <h2>Financial Executive Reports</h2>
          <p>Generate, review, print, and export comprehensive monthly statements.</p>
        </div>

        <div className="head-actions">
          {/* Period selector */}
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

          <button className="secondary-btn" onClick={handleExportCSV} title="Download CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="primary-btn" onClick={handlePrint} title="Print or save as PDF">
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET */}
      <div className="report-sheet panel">
        {/* Report Header for Print */}
        <div className="report-sheet-header">
          <div className="report-brand">
            <span className="brand-mark">S</span>
            <div>
              <h3>SpendWise Statement</h3>
              <p className="muted">Personal Finance & Wealth Ledger</p>
            </div>
          </div>
          <div className="report-meta-box">
            <div className="report-period-tag">{report?.monthName || 'Period'}</div>
            <small className="muted">Generated on {new Date().toLocaleDateString('en-IN')}</small>
          </div>
        </div>

        {/* SECTION 1: EXECUTIVE SUMMARY */}
        <div className="report-section">
          <h4 className="section-title">1. Executive Summary</h4>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card green">
              <div className="stat-label">Total Inflows</div>
              <div className="stat-value">{formatCurrency(report?.totalIncome || 0)}</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Total Outflows</div>
              <div className="stat-value">{formatCurrency(report?.totalExpense || 0)}</div>
            </div>
            <div className="stat-card gold">
              <div className="stat-label">Net Available Movement</div>
              <div className="stat-value">
                {formatCurrency(
                  report?.availableSavings ??
                    Math.max(0, (report?.netSavings || 0) - (report?.totalTransfers || 0))
                )}
              </div>
            </div>
            <div className="stat-card blue">
              <div className="stat-label">Savings Rate</div>
              <div className="stat-value">{report?.savingsRate || 0}%</div>
            </div>
          </div>
          {(report?.totalTransfers || 0) > 0 && (
            <div style={{ margin: '-10px 0 20px', fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 20 }}>
              <span>Total Retained: <b style={{ color: 'var(--fg)' }}>{formatCurrency(report?.netSavings || 0)}</b></span>
              <span>Allocated to Goals: <b style={{ color: 'var(--gold)' }}>{formatCurrency(report?.totalTransfers || 0)}</b></span>
            </div>
          )}
        </div>

        {/* SECTION 2: CATEGORY EXPENDITURE BREAKDOWN */}
        <div className="report-section">
          <h4 className="section-title">2. Category Expenditure Breakdown</h4>
          {report?.categories?.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="th-right">Amount Spent</th>
                    <th className="th-right">Share of Outflows</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categories.map((c) => (
                    <tr key={c.category}>
                      <td>
                        <b>{c.category}</b>
                      </td>
                      <td className="th-right">{formatCurrency(c.amount)}</td>
                      <td className="th-right">
                        <div className="percentage-share-cell">
                          <span>{c.percentage}%</span>
                          <div className="micro-bar">
                            <div className="micro-fill" style={{ width: `${c.percentage}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No category expenses recorded for this statement period.</p>
          )}
        </div>

        {/* SECTION 3: BUDGET PERFORMANCE */}
        <div className="report-section">
          <h4 className="section-title">3. Budget Performance & Compliance</h4>
          {report?.budgetReport?.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="th-right">Budget Limit</th>
                    <th className="th-right">Actual Spent</th>
                    <th className="th-right">Variance</th>
                    <th className="th-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.budgetReport.map((b) => {
                    const isExceeded = b.spent > b.budget;
                    return (
                      <tr key={b.category}>
                        <td>
                          <b>{b.category}</b>
                        </td>
                        <td className="th-right">{formatCurrency(b.budget)}</td>
                        <td className="th-right">{formatCurrency(b.spent)}</td>
                        <td className={`th-right ${isExceeded ? 'expense-text' : 'income-text'}`}>
                          {isExceeded ? '−' : '+'}
                          {formatCurrency(Math.abs(b.variance))}
                        </td>
                        <td className="th-right">
                          <span className={`status-pill ${isExceeded ? 'danger' : 'good'}`}>
                            {isExceeded ? 'Exceeded' : `${b.percentage}% Used`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No budgets configured for this month.</p>
          )}
        </div>

        {/* SECTION 4: DETAILED TRANSACTIONS AUDIT */}
        <div className="report-section">
          <h4 className="section-title">
            4. Itemized Ledger ({report?.transactions?.length || 0} Transactions)
          </h4>
          {report?.transactions?.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th className="th-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <b>{t.title}</b>
                        {t.description && <small className="tx-cell-notes">{t.description}</small>}
                      </td>
                      <td>
                        <span className={`type-tag ${t.type}`}>
                          {t.type === 'income' ? '+ Inflow' : t.type === 'transfer' ? '⇄ Goal Allocation' : '− Outflow'}
                        </span>
                      </td>
                      <td>{t.category}</td>
                      <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td className={`th-right ${t.type === 'income' ? 'income-text' : t.type === 'transfer' ? 'gold-text' : 'expense-text'}`}>
                        {t.type === 'income' ? '+' : t.type === 'transfer' ? '⇄ ' : '−'}
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">No transactions recorded in this period.</p>
          )}
        </div>

        {/* Report Footer */}
        <div className="report-sheet-footer">
          <small className="muted">
            SpendWise Automated Financial Report • Confidential • Generated for personal tracking.
          </small>
        </div>
      </div>
    </div>
  );
}
