import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(false);

  const { setUnreadNotifCount } = useAuth();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const items = res.data.notifications || [];
      const unread = res.data.unreadCount || 0;
      setNotifications(items);
      setUnreadCount(unread);
      setUnreadNotifCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setUnreadNotifCount((c) => Math.max(0, c - 1));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      setUnreadNotifCount(0);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark all read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const deletedItem = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (deletedItem && !deletedItem.read) {
        setUnreadCount((c) => Math.max(0, c - 1));
        setUnreadNotifCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
      setUnreadNotifCount(0);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear notifications');
    }
  };

  const filteredItems = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon size={18} className="notif-type-icon danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="notif-type-icon warning" />;
      case 'success':
        return <Sparkles size={18} className="notif-type-icon success" />;
      default:
        return <Info size={18} className="notif-type-icon info" />;
    }
  };

  return (
    <div className="page notifications-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">SYSTEM ALERTS & THRESHOLDS</div>
          <h2>Financial Notifications</h2>
          <p>Autonomous monitoring for budget limits, recurring payment dues, and goal progress milestones.</p>
        </div>

        <div className="head-actions">
          {unreadCount > 0 && (
            <button className="secondary-btn" onClick={markAllRead}>
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button className="icon-btn delete-btn" onClick={clearAllNotifications} title="Clear all notifications">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="filter-tabs-row">
        <button
          className={`tab-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          className={`tab-pill ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="notifications-list-container">
        {filteredItems.map((n) => (
          <div
            className={`panel notification-card-item ${n.read ? 'read-card' : 'unread-card'} ${n.type}`}
            key={n._id}
          >
            <div className="notif-icon-col">{getNotificationIcon(n.type)}</div>

            <div className="notif-content-col">
              <div className="notif-title-row">
                <h4 className="notif-title">{n.title}</h4>
                {!n.read && <span className="unread-dot-badge" />}
              </div>
              <p className="notif-message-text">{n.message}</p>
              <div className="notif-timestamp">
                <Calendar size={12} />
                <span>
                  {new Date(n.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="notif-actions-col">
              {!n.read && (
                <button
                  className="icon-btn check-btn"
                  onClick={() => markAsRead(n._id)}
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
              <button
                className="icon-btn delete-btn"
                onClick={() => deleteNotification(n._id)}
                title="Delete notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="panel empty-state-panel">
            <Bell size={32} className="empty-icon" />
            <p>
              {filter === 'unread'
                ? 'You have no unread notifications.'
                : 'No notifications present.'}
            </p>
            <small className="muted">
              Alerts are created when budgets exceed 80%, bills approach due dates, or goals reach milestones.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
