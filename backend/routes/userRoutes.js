import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { validatePassword } from './authRoutes.js';

const router = express.Router();
router.use(auth);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { name, currency, theme, notificationsEnabled } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (currency) update.currency = currency;
    if (theme) update.theme = theme;
    if (notificationsEnabled !== undefined) update.notificationsEnabled = notificationsEnabled;

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/user/change-password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
