import express from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const items = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });
    res.json({ notifications: items, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all - mark all read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read - mark single read
router.put('/:id/read', async (req, res) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications/clear-all - delete all notifications
router.delete('/clear-all', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications/:id - delete single
router.delete('/:id', async (req, res) => {
  try {
    const result = await Notification.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
