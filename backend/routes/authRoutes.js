import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const generateToken = (u) =>
  jwt.sign({ id: u._id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Email format validator
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

// Password rules validator:
// - Minimum 8 characters
// - At least 1 uppercase letter
// - At least 1 lowercase letter
// - At least 2 digits
// - At least 1 special character
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 lowercase letter' };
  }
  const digitCount = (password.match(/\d/g) || []).length;
  if (digitCount < 2) {
    return { valid: false, message: 'Password must contain at least 2 numbers' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 special character' };
  }
  return { valid: true };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Always normalize to trimmed lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Prevent duplicate accounts with case-insensitive search
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email address already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
    });

    res.status(201).json({
      token: generateToken(u),
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        currency: u.currency || 'INR',
        theme: u.theme || 'dark',
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Always normalize login email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    const u = await User.findOne({ email: normalizedEmail });
    if (!u) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, u.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(u),
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        currency: u.currency || 'INR',
        theme: u.theme || 'dark',
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error during login' });
  }
});

// GET /api/auth/me - session verification
router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.userId).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        currency: u.currency || 'INR',
        theme: u.theme || 'dark',
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
