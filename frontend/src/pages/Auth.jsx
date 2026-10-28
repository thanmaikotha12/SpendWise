import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Coins,
  PiggyBank,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  // 3D Parallax Tilt state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);

  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  // Mouse move handler for realistic 3D perspective parallax
  const handleMouseMove = (e) => {
    if (!sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 10; // deg
    const tiltY = (x / (rect.width / 2)) * 10; // deg
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Password rules evaluation for registration
  const passwordCriteria = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      digits: (p.match(/\d/g) || []).length >= 2,
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(p),
    };
  }, [form.password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Normalize email: trim and lowercase
    const normalizedEmail = form.email.trim().toLowerCase();

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return setError('Please provide a valid email address (e.g. name@domain.com)');
    }

    if (mode === 'register' && !isPasswordValid) {
      return setError('Password does not fulfill all required security requirements');
    }

    try {
      if (mode === 'login') {
        await login({
          email: normalizedEmail,
          password: form.password,
        });
      } else {
        await register({
          name: form.name.trim(),
          email: normalizedEmail,
          password: form.password,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="auth-page">
      <div className="ambient a1" />
      <div className="ambient a2" />
      <div className="ambient a3" />

      {/* 3D-INSPIRED MONEY-FLOW HERO SECTION (INCOME -> SPENDING -> SAVINGS) */}
      <section
        className="money-scene-3d"
        ref={sceneRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="scene-header">
          <div className="brand">
            <span className="brand-mark">S</span>
            <span className="brand-title">SpendWise</span>
          </div>

          <div className="hero-kicker">
            <Sparkles size={13} className="kicker-sparkle" />
            <span>INTELLIGENT CASH FLOW ARCHITECTURE</span>
          </div>

          <h2 className="hero-heading">
            Move money with <span className="gold-shimmer">absolute clarity.</span>
          </h2>

          <p className="hero-subtext">
            Experience real-time tracking, disciplined budget allocation, and data-aware AI analytics engineered for intentional wealth growth.
          </p>
        </div>

        {/* 3D PERSPECTIVE STAGE: THREE RAISED PEDESTALS & ANIMATED MONEY FLOW */}
        <div
          className="stage-3d-wrapper"
          style={{
            transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* FLOWING MONEY PATH RIBBON WITH TRAVELING COINS */}
          <div className="flow-path-container">
            <svg className="flow-svg" viewBox="0 0 700 240" fill="none">
              <defs>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#d4af37" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* Background glowing path */}
              <path
                d="M 120 160 C 230 70, 270 200, 360 130 C 450 60, 490 190, 580 160"
                className="flow-path-bg"
              />
              {/* Flowing animated pulse */}
              <path
                d="M 120 160 C 230 70, 270 200, 360 130 C 450 60, 490 190, 580 160"
                className="flow-path-pulse"
              />
            </svg>

            {/* FLOATING 3D COIN TRAVELING ON PATH */}
            <div className="coin-traveler">
              <div className="coin-3d mini-coin">
                <div className="coin-inner">₹</div>
              </div>
            </div>
          </div>

          {/* 3D PLATFORMS ROW: INCOME (LEFT) -> SPENDING (CENTER) -> SAVINGS (RIGHT) */}
          <div className="pedestals-container-3d">
            {/* PLATFORM 1: INCOME (LEFT) */}
            <div className="pedestal-card platform-income">
              <div className="pedestal-base" />
              <div className="pedestal-content">
                <div className="platform-tag income-tag">
                  <ArrowUpRight size={14} />
                  <span>INCOME</span>
                </div>
                <div className="floating-object object-card">
                  <div className="object-header">
                    <span className="dot green-dot" />
                    <span className="object-title">Salary & Freelance</span>
                  </div>
                  <div className="object-value income-val">+₹50,000</div>
                  <div className="object-sub">Monthly Inflows</div>
                </div>
                {/* 3D Floating Rupee Coin */}
                <div className="coin-3d coin-anchor-left">
                  <div className="coin-inner">₹</div>
                </div>
              </div>
            </div>

            {/* PLATFORM 2: SPENDING (CENTER - MAIN HERO PEDESTAL) */}
            <div className="pedestal-card platform-spending">
              <div className="pedestal-base main-base" />
              <div className="pedestal-content">
                <div className="platform-tag spending-tag">
                  <ArrowDownRight size={14} />
                  <span>SPENDING</span>
                </div>
                <div className="floating-object object-card central-card">
                  <div className="card-glare" />
                  <div className="emv-chip">
                    <div className="chip-line" />
                    <div className="chip-line" />
                  </div>
                  <div className="object-value expense-val">−₹22,400</div>
                  <div className="object-sub">Disciplined Budgets</div>
                </div>
                {/* 3D Floating Rupee Coin */}
                <div className="coin-3d coin-anchor-center">
                  <div className="coin-inner">₹</div>
                </div>
              </div>
            </div>

            {/* PLATFORM 3: SAVINGS (RIGHT) */}
            <div className="pedestal-card platform-savings">
              <div className="pedestal-base" />
              <div className="pedestal-content">
                <div className="platform-tag savings-tag">
                  <TrendingUp size={14} />
                  <span>SAVINGS</span>
                </div>
                <div className="floating-object object-card">
                  <div className="object-header">
                    <PiggyBank size={14} className="gold-text" />
                    <span className="object-title">Wealth Vault</span>
                  </div>
                  <div className="object-value savings-val">₹27,600</div>
                  <div className="object-sub">55.2% Retained</div>
                </div>
                {/* 3D Floating Rupee Coin */}
                <div className="coin-3d coin-anchor-right">
                  <div className="coin-inner">₹</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST PILLARS */}
        <div className="trust-row">
          <div className="trust-pill">
            <ShieldCheck size={16} className="pill-icon" />
            <span>Bank-grade security</span>
          </div>
          <div className="trust-pill">
            <TrendingUp size={16} className="pill-icon" />
            <span>Real database insights</span>
          </div>
          <div className="trust-pill">
            <WalletCards size={16} className="pill-icon" />
            <span>Disciplined budgets</span>
          </div>
        </div>
      </section>

      {/* AUTHENTICATION FORM CARD */}
      <section className="auth-card-section">
        <div className="auth-card-inner">
          <div className="mobile-brand-header">
            <span className="brand-mark">S</span>
            <span className="brand-title">SpendWise</span>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          <div className="auth-heading">
            <span className="auth-badge">
              {mode === 'login' ? 'SECURE PORTAL' : 'FREE ACCOUNT'}
            </span>
            <h1>
              {mode === 'login' ? 'Welcome back to SpendWise' : 'Create your financial command center'}
            </h1>
            <p>
              {mode === 'login'
                ? 'Sign in to access your budgets, real-time ledgers, and live financial assistant.'
                : 'Take control of every rupee earned, spent, and saved with complete clarity.'}
            </p>
          </div>

          {error && <div className="auth-error-banner">{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field-wrap">
                  <UserIcon size={18} className="field-icon" />
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Anvitha Sharma"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field-wrap">
                <Mail size={18} className="field-icon" />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter strong password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REAL-TIME PASSWORD VALIDATION CHECKLIST FOR REGISTRATION */}
            {mode === 'register' && (
              <div className="password-rules-box">
                <span className="rules-header">Password Requirements:</span>
                <div className="rules-list">
                  <div className={`rule-item ${passwordCriteria.length ? 'met' : ''}`}>
                    {passwordCriteria.length ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>Minimum 8 characters</span>
                  </div>
                  <div className={`rule-item ${passwordCriteria.uppercase ? 'met' : ''}`}>
                    {passwordCriteria.uppercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`rule-item ${passwordCriteria.lowercase ? 'met' : ''}`}>
                    {passwordCriteria.lowercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div className={`rule-item ${passwordCriteria.digits ? 'met' : ''}`}>
                    {passwordCriteria.digits ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>At least 2 numbers (0-9)</span>
                  </div>
                  <div className={`rule-item ${passwordCriteria.special ? 'met' : ''}`}>
                    {passwordCriteria.special ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>At least 1 special character (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}

            <button
              className="auth-submit-btn"
              disabled={loading || (mode === 'register' && !isPasswordValid)}
              type="submit"
            >
              <span>
                {loading
                  ? 'Authenticating…'
                  : mode === 'login'
                    ? 'Sign In to Dashboard'
                    : 'Create Account'}
              </span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer-prompt">
            <span>
              {mode === 'login' ? "Don't have an account yet?" : 'Already have an existing account?'}
            </span>
            <button
              type="button"
              className="switch-link"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}