import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function StatCard({ label, value, icon: Icon, accent = 'gold', sub, trend }) {
  const { formatCurrency } = useAuth();

  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-card-header">
        <div className="stat-icon">{Icon && <Icon size={20} />}</div>
        {trend && (
          <span className={`stat-trend ${trend.type || 'positive'}`}>
            {trend.text}
          </span>
        )}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{formatCurrency(value)}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
