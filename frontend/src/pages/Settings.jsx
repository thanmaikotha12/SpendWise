import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Moon,
  Sun,
  Bell,
  Coins,
  CheckCircle,
  Save,
  Lock,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user, updateUser, theme, toggleTheme, currency, setCurrency } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ text: '', type: '' });

    try {
      const res = await api.put('/user/profile', {
        name: profileForm.name,
        currency,
        theme,
        notificationsEnabled,
      });

      updateUser(res.data);
      setProfileMsg({ text: 'Profile details saved successfully!', type: 'success' });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const newPwd = passwordForm.newPassword;
  const passwordCriteria = {
    length: newPwd.length >= 8,
    upper: /[A-Z]/.test(newPwd),
    lower: /[a-z]/.test(newPwd),
    digits: (newPwd.match(/\d/g) || []).length >= 2,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPwd),
  };
  const isNewPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
    }

    if (!isNewPasswordValid) {
      return setPasswordMsg({
        text: 'New password does not meet all required security criteria (min 8 chars, 1 uppercase, 1 lowercase, 2 digits, 1 special character)',
        type: 'error',
      });
    }

    setSavingPassword(true);
    try {
      await api.put('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMsg({ text: 'Password successfully updated!', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password',
        type: 'error',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page settings-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">USER PREFERENCES</div>
          <h2>Account & App Settings</h2>
          <p>Manage your profile, visual themes, currency formats, and security credentials.</p>
        </div>
      </div>

      <div className="two-col-layout">
        {/* LEFT COLUMN: PROFILE & PREFERENCES */}
        <div className="settings-col">
          {/* PROFILE CARD */}
          <div className="panel settings-card">
            <div className="settings-card-head">
              <User size={19} className="settings-head-icon" />
              <div>
                <h3>Personal Profile</h3>
                <p className="muted">Your identity information across SpendWise</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-field">
                <label>Full Name</label>
                <input
                  required
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Email Address</label>
                <input
                  disabled
                  type="email"
                  value={profileForm.email}
                  title="Email cannot be changed directly"
                  style={{ opacity: 0.7 }}
                />
              </div>

              {profileMsg.text && (
                <div className={`form-feedback-message ${profileMsg.type}`}>
                  {profileMsg.text}
                </div>
              )}

              <button className="primary-btn submit-btn" disabled={savingProfile} type="submit">
                <Save size={16} />
                <span>{savingProfile ? 'Saving…' : 'Save Profile'}</span>
              </button>
            </form>
          </div>

          {/* APPLICATION PREFERENCES */}
          <div className="panel settings-card">
            <div className="settings-card-head">
              <Coins size={19} className="settings-head-icon" />
              <div>
                <h3>App Preferences</h3>
                <p className="muted">Display currency and visual theme styling</p>
              </div>
            </div>

            <div className="preferences-body">
              {/* THEME TOGGLE OPTION */}
              <div className="pref-row">
                <div>
                  <div className="pref-title">Appearance Theme</div>
                  <div className="pref-desc">Choose between Obsidian Gold and Clean High-Contrast</div>
                </div>

                <div className="theme-toggle-chips">
                  <button
                    type="button"
                    className={`theme-chip ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    <Moon size={15} /> Dark Mode
                  </button>
                  <button
                    type="button"
                    className={`theme-chip ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    <Sun size={15} /> Light Mode
                  </button>
                </div>
              </div>

              {/* CURRENCY SELECTOR */}
              <div className="pref-row">
                <div>
                  <div className="pref-title">Default Currency</div>
                  <div className="pref-desc">Symbol used across statements, reports, and ledger</div>
                </div>

                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="currency-select"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                </select>
              </div>

              {/* NOTIFICATION TOGGLE */}
              <div className="pref-row">
                <div>
                  <div className="pref-title">Autonomous Smart Alerts</div>
                  <div className="pref-desc">Trigger threshold alerts when budgets exceed 80%</div>
                </div>

                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  />
                  <span className="slider" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & PASSWORD */}
        <div className="settings-col">
          <div className="panel settings-card">
            <div className="settings-card-head">
              <Shield size={19} className="settings-head-icon" />
              <div>
                <h3>Security & Password</h3>
                <p className="muted">Ensure your financial portal remains protected</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-field">
                <label>Current Password *</label>
                <input
                  required
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="form-field">
                <label>New Password *</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Min 8 characters (Upper, Lower, 2 Digits, Special)"
                />
              </div>

              {passwordForm.newPassword && (
                <div className="password-criteria-box" style={{ marginBottom: 16 }}>
                  <div className="criteria-header">Password Security Requirements:</div>
                  <div className="criteria-grid">
                    <div className={`criteria-item ${passwordCriteria.length ? 'met' : ''}`}>
                      <CheckCircle size={13} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.upper ? 'met' : ''}`}>
                      <CheckCircle size={13} />
                      <span>1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.lower ? 'met' : ''}`}>
                      <CheckCircle size={13} />
                      <span>1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.digits ? 'met' : ''}`}>
                      <CheckCircle size={13} />
                      <span>At least 2 numbers (0-9)</span>
                    </div>
                    <div className={`criteria-item ${passwordCriteria.special ? 'met' : ''}`}>
                      <CheckCircle size={13} />
                      <span>1 special symbol (!@#$...)</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>Confirm New Password *</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Repeat new password"
                />
              </div>

              {passwordMsg.text && (
                <div className={`form-feedback-message ${passwordMsg.type}`}>
                  {passwordMsg.text}
                </div>
              )}

              <button className="primary-btn submit-btn" disabled={savingPassword} type="submit">
                <Lock size={16} />
                <span>{savingPassword ? 'Updating…' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
