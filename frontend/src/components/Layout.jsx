import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  WalletCards,
  PieChart,
  Target,
  Repeat2,
  TrendingUp,
  FileText,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: WalletCards },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/recurring', label: 'Recurring', icon: Repeat2 },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
  { to: '/notifications', label: 'Notifications', icon: Bell, isNotification: true },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }) {
  const { user, logout, theme, toggleTheme, unreadNotifCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <div className="brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <span className="brand-mark">S</span>
            <div className="brand-text">
              <span className="brand-title">SpendWise</span>
              <span className="brand-tag">SMART FINANCE</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>
          {navLinks.map(({ to, label, icon: Icon, badge, isNotification }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                  <Icon size={19} className="nav-icon" />
                  <span>{label}</span>
                </div>
                {badge && <span className="nav-badge-ai">{badge}</span>}
                {isNotification && unreadNotifCount > 0 && (
                  <span className="nav-badge-count">{unreadNotifCount}</span>
                )}
                {isActive && <ChevronRight size={14} className="active-arrow" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-snippet" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
            <div className="avatar">{user?.name ? user.name[0].toUpperCase() : 'S'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-trigger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="greeting-block">
              <span className="eyebrow">PERSONAL FINANCE MANAGEMENT</span>
              <h1>
                {getGreeting()}, <span className="gold-text">{firstName}</span>
              </h1>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Theme Toggle Button */}
            <button
              className="topbar-icon-btn theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Notifications Button */}
            <button
              className="topbar-icon-btn notif-btn"
              onClick={() => navigate('/notifications')}
              title="Notifications"
            >
              <Bell size={19} />
              {unreadNotifCount > 0 && (
                <span className="notif-indicator-dot">{unreadNotifCount}</span>
              )}
            </button>

            {/* Profile Avatar */}
            <div
              className="avatar topbar-avatar"
              onClick={() => navigate('/settings')}
              title="Profile & Settings"
              style={{ cursor: 'pointer' }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
          </div>
        </header>

        <main className="main-content-scrollable">{children}</main>
      </div>
    </div>
  );
}
