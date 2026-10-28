import express from 'express';
import Recurring from '../models/RecurringExpense.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
import { checkRecurringReminders, checkBudgets } from '../utils/notifications.js';

const router = express.Router();
router.use(auth);

// GET /api/recurring
router.get('/', async (req, res) => {
  try {
    await checkRecurringReminders(req.userId);
    const items = await Recurring.find({ userId: req.userId }).sort({ nextDueDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recurring
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, frequency, nextDueDate, paymentMethod } = req.body;
    if (!title || !amount || !nextDueDate) {
      return res.status(400).json({ message: 'Title, amount, and next due date are required' });
    }

    const item = await Recurring.create({
      userId: req.userId,
      title: title.trim(),
      amount: Number(amount),
      category: category || 'Bills',
      frequency: frequency || 'monthly',
      nextDueDate: new Date(nextDueDate),
      paymentMethod: paymentMethod || 'Auto Debit',
      active: true,
    });

    await checkRecurringReminders(req.userId);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/recurring/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, category, frequency, nextDueDate, paymentMethod, active } = req.body;
    const update = {};
    if (title) update.title = title.trim();
    if (amount !== undefined) update.amount = Number(amount);
    if (category) update.category = category;
    if (frequency) update.frequency = frequency;
    if (nextDueDate) update.nextDueDate = new Date(nextDueDate);
    if (paymentMethod) update.paymentMethod = paymentMethod;
    if (active !== undefined) update.active = active;

    const item = await Recurring.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Recurring.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Recurring expense not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/recurring/process-due - processes due recurring expenses into real transactions without duplicate creation
router.post('/process-due', async (req, res) => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const due = await Recurring.find({
      userId: req.userId,
      active: true,
      nextDueDate: { $lte: endOfToday },
    });

    let count = 0;
    for (const r of due) {
      // Check for duplicate transaction on same date for same recurring title
      const startOfDay = new Date(r.nextDueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(r.nextDueDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingTx = await Transaction.findOne({
        userId: req.userId,
        title: r.title,
        date: { $gte: startOfDay, $lte: endOfDay },
        type: 'expense',
      });

      if (!existingTx) {
        await Transaction.create({
          userId: req.userId,
          title: r.title,
          amount: r.amount,
          type: 'expense',
          category: r.category,
          paymentMethod: r.paymentMethod || 'Auto Debit',
          date: r.nextDueDate,
          description: `Auto-generated recurring payment: ${r.title} (${r.frequency})`,
        });
        count++;
      }

      // Advance nextDueDate
      const d = new Date(r.nextDueDate);
      if (r.frequency === 'weekly') d.setDate(d.getDate() + 7);
      else if (r.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1); // default monthly

      r.nextDueDate = d;
      await r.save();
    }

    if (count > 0) {
      await checkBudgets(req.userId);
    }

    res.json({
      message: count > 0 ? `Successfully recorded ${count} recurring payment(s) into transactions.` : 'All recurring expenses are up to date.',
      count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
