import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  PieChart,
  Bot,
  PiggyBank,
  Receipt,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Target,
  Sliders,
  Bell,
  ShoppingBag,
  Car,
  Utensils,
  Gamepad2,
  Plane,
  Home,
  BookOpen,
  Heart,
} from 'lucide-react';
import SpendWise3DCanvas from '../components/landing/SpendWise3DCanvas.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login, register, loading } = useAuth();

  // Scroll & mouse tracking
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Auth Form State (Scene 6)
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [authError, setAuthError] = useState('');

  // Password validation criteria
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

  // Track global window scroll progress (0 to 1)
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const current = window.scrollY;
      const progress = Math.min(1, Math.max(0, current / totalScroll));
      setScrollProgress(progress);
    };

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const normalizedEmail = form.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return setAuthError('Please enter a valid email address (e.g. name@example.com)');
    }

    if (authMode === 'register' && !isPasswordValid) {
      return setAuthError('Password does not fulfill all required security criteria');
    }

    try {
      if (authMode === 'login') {
        await login({ email: normalizedEmail, password: form.password });
      } else {
        await register({ name: form.name.trim(), email: normalizedEmail, password: form.password });
      }
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="spendwise-cinematic-root">
      {/* 3D WEBGL CINEMATIC CANVAS (Directly matching reference image) */}
      <SpendWise3DCanvas scrollProgress={scrollProgress} mousePos={mousePos} />

      {/* ATMOSPHERIC VOLUMETRIC FOREST-GREEN & GOLD GLOWS */}
      <div className="cinematic-ambient ambient-top-glow" />
      <div className="cinematic-ambient ambient-mid-emerald" />
      <div className="cinematic-ambient ambient-bottom-gold" />

      {/* TOP NAVIGATION BAR (Matching reference image: SpendWise | Features About FAQs | Explore) */}
      <header className="cinematic-nav">
        <div className="nav-inner-wrap">
          <div className="nav-brand" onClick={() => scrollToSection('hero')}>
            <span className="brand-logo-mark">S</span>
            <span className="brand-title-text">SpendWise</span>
          </div>

          <nav className="nav-menu-links">
            <button type="button" onClick={() => scrollToSection('scene-expenses')} className="nav-link">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection('scene-goals')} className="nav-link">
              About
            </button>
            <button type="button" onClick={() => scrollToSection('scene-budgets')} className="nav-link">
              FAQs
            </button>
          </nav>

          <div className="nav-action-col">
            {user ? (
              <button
                type="button"
                className="gold-pill-btn"
                onClick={() => navigate('/dashboard')}
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="gold-pill-btn"
                onClick={() => scrollToSection('scene-auth')}
              >
                <span>Explore</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTINUOUS SCROLL STORYLINE (Matching the 6 Reference Image Panels) */}
      <main className="cinematic-story-stack">
        {/* ========================================================= */}
        {/* PANEL 1: HERO (Take Control of Your Money) */}
        {/* ========================================================= */}
        <section id="hero" className="story-panel panel-hero">
          <div className="panel-content-wrap">
            <h1 className="cinematic-serif-heading hero-title">
              Take<br />
              Control of<br />
              Your Money
            </h1>

            <p className="hero-lead-kicker">Track. Plan. Save. Grow.</p>

            <p className="hero-intro-text">
              SpendWise helps you understand your spending, manage your budget and build a better financial future.
            </p>

            <div className="hero-action-row">
              <button
                type="button"
                className="gold-pill-btn hero-cta-btn"
                onClick={() => scrollToSection('scene-auth')}
              >
                <span>Explore SpendWise</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Handwritten-style curved scroll hint matching reference image */}
            <div className="scroll-down-hint" onClick={() => scrollToSection('scene-expenses')}>
              <span className="curved-handwritten-text">Scroll down</span>
              <div className="hint-arrow-down">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL 2: TRACK EVERY EXPENSE ("As you scroll, elements come out") */}
        {/* ========================================================= */}
        <section id="scene-expenses" className="story-panel panel-expenses">
          <div className="panel-content-wrap">
            {/* Curved callout annotation matching reference image */}
            <div className="curved-callout-annotation">
              <span className="callout-text">As you scroll, elements come out</span>
              <svg className="curved-arrow-svg" width="34" height="28" viewBox="0 0 34 28" fill="none">
                <path d="M4 4 C14 22, 22 24, 28 20 M28 20 L22 14 M28 20 L24 26" stroke="#dfba76" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="cinematic-serif-heading section-title">
              Track<br />
              Every Expense
            </h2>

            <p className="panel-description">
              See exactly where your money goes with simple and smart expense tracking.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL 3: BUILD YOUR SAVINGS (Glass Savings Jar Centerpiece) */}
        {/* ========================================================= */}
        <section id="scene-goals" className="story-panel panel-savings">
          <div className="panel-content-wrap">
            <h2 className="cinematic-serif-heading section-title">
              Build<br />
              Your Savings
            </h2>

            <p className="panel-description">
              Set exactly, make progress, and turn your dreams into reality.
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL 4: PLAN BETTER, ACHIEVE MORE (Budgets & Glass Cards) */}
        {/* ========================================================= */}
        <section id="scene-budgets" className="story-panel panel-budgets">
          <div className="panel-content-wrap">
            <h2 className="cinematic-serif-heading section-title">
              Plan Better,<br />
              Achieve More
            </h2>

            <p className="panel-description">
              Create budgets, track progress, get insights and stay on top of your financial goals.
            </p>

            {/* Floating Glass Budget Indicator Cards matching reference image */}
            <div className="budget-glass-cards-row">
              <div className="glass-indicator-pill">
                <div className="indicator-meta">
                  <span className="pill-tag">Budget</span>
                  <span className="pill-amount">₹ 3,000</span>
                </div>
                <div className="glowing-progress-track">
                  <div className="glowing-progress-fill" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="glass-indicator-pill">
                <div className="indicator-meta">
                  <span className="pill-tag">Savings Goal</span>
                  <span className="pill-amount">₹ 20,000</span>
                </div>
                <div className="glowing-progress-track">
                  <div className="glowing-progress-fill" style={{ width: '64%' }} />
                </div>
              </div>

              <div className="glass-indicator-pill report-pill">
                <span className="pill-tag">Monthly Report</span>
                <div className="mini-bars-glyph">
                  <div className="m-bar" style={{ height: '35%' }} />
                  <div className="m-bar" style={{ height: '55%' }} />
                  <div className="m-bar" style={{ height: '80%' }} />
                  <div className="m-bar active-gold" style={{ height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL 5: SMARTER INSIGHTS WITH AI (Avatar & Category Pills) */}
        {/* ========================================================= */}
        <section id="scene-analytics" className="story-panel panel-ai">
          <div className="panel-content-wrap">
            <h2 className="cinematic-serif-heading section-title">
              Smarter Insights<br />
              with AI
            </h2>

            <p className="panel-description">
              Analyze your spending, get personalized insights and make smarter financial decisions with AI assistance.
            </p>

            {/* Floating Category Pills matching reference image */}
            <div className="category-chips-float-list">
              <div className="cat-chip-item">
                <div className="cat-chip-icon food-icon"><Utensils size={14} /></div>
                <span className="cat-chip-name">Food</span>
                <span className="cat-chip-val">−₹500</span>
              </div>

              <div className="cat-chip-item">
                <div className="cat-chip-icon shopping-icon"><ShoppingBag size={14} /></div>
                <span className="cat-chip-name">Shopping</span>
                <span className="cat-chip-val">−₹1,200</span>
              </div>

              <div className="cat-chip-item">
                <div className="cat-chip-icon transport-icon"><Car size={14} /></div>
                <span className="cat-chip-name">Transport</span>
                <span className="cat-chip-val">−₹500</span>
              </div>

              <div className="cat-chip-item">
                <div className="cat-chip-icon ent-icon"><Gamepad2 size={14} /></div>
                <span className="cat-chip-name">Entertainment</span>
                <span className="cat-chip-val">−₹450</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PANEL 6: YOUR BRIGHTER FINANCIAL FUTURE STARTS HERE (Auth) */}
        {/* ========================================================= */}
        <section id="scene-auth" className="story-panel panel-finale">
          <div className="panel-content-wrap finale-layout">
            <div className="finale-header-block">
              <h2 className="cinematic-serif-heading finale-giant-heading">
                Your<br />
                Brighter<br />
                Financial<br />
                Future<br />
                Starts Here
              </h2>

              <p className="finale-subtext">
                Join SpendWise and take the first step towards a smarter, healthier and more secure financial life.
              </p>

              <button
                type="button"
                className="gold-pill-btn hero-cta-btn"
                onClick={() => {
                  const cardEl = document.getElementById('auth-card-anchor');
                  if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore SpendWise</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* DARK GLASSMORPHIC LOGIN / REGISTER CARD (Exact visual from Panel 6) */}
            <div id="auth-card-anchor" className="cinematic-glass-auth-card">
              <div className="auth-card-head">
                <div className="auth-coin-logo">
                  <span>S</span>
                </div>
                <div className="auth-brand-name">SpendWise</div>
                <h3 className="auth-welcome-title">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p className="auth-welcome-sub">
                  {authMode === 'login'
                    ? 'Sign in to continue to your account'
                    : 'Start your personalized wealth journey'}
                </p>
              </div>

              {authError && <div className="auth-error-chip">{authError}</div>}

              <form className="cinematic-auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="form-field-group">
                    <label>Full Name</label>
                    <div className="input-wrap">
                      <UserIcon size={16} className="input-left-icon" />
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Anvitha Sharma"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="form-field-group">
                  <label>Email</label>
                  <div className="input-wrap">
                    <Mail size={16} className="input-left-icon" />
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value.toLowerCase().replace(/\s+/g, ''),
                        })
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label>Password</label>
                  <div className="input-wrap">
                    <Lock size={16} className="input-left-icon" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {authMode === 'login' && (
                  <div className="forgot-password-row">
                    <span className="forgot-link">Forgot password?</span>
                  </div>
                )}

                {/* Password validation criteria checklist for registration */}
                {authMode === 'register' && (
                  <div className="password-rules-box">
                    <span className="rules-header">Security Requirements:</span>
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
                  type="submit"
                  disabled={loading || (authMode === 'register' && !isPasswordValid)}
                  className="gold-pill-btn auth-submit-pill"
                >
                  <span>
                    {loading
                      ? 'Authenticating…'
                      : authMode === 'login'
                        ? 'Sign In'
                        : 'Create Account'}
                  </span>
                </button>
              </form>

              <div className="auth-card-footer">
                <span>
                  {authMode === 'login'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  className="switch-auth-link"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                >
                  {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="cinematic-footer">
        <div className="footer-wrap">
          <div className="footer-brand">
            <span className="brand-logo-mark">S</span>
            <span className="brand-title-text">SpendWise</span>
          </div>
          <p className="footer-tagline">
            Smart Expense Tracker &amp; Personal Finance Management System.
          </p>
          <div className="footer-links-row">
            <button type="button" onClick={() => scrollToSection('hero')}>Top</button>
            <button type="button" onClick={() => scrollToSection('scene-expenses')}>Features</button>
            <button type="button" onClick={() => scrollToSection('scene-goals')}>About</button>
            <button type="button" onClick={() => scrollToSection('scene-budgets')}>FAQs</button>
            <button type="button" onClick={() => scrollToSection('scene-auth')}>Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
