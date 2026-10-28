import express from 'express';
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
import { checkBudgets } from '../utils/notifications.js';

const router = express.Router();
router.use(auth);

// GET /api/budgets?month=X&year=Y
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ userId: req.userId, month, year });

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'expense',
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = Object.fromEntries(agg.map((x) => [x._id, x.spent]));

    const response = budgets.map((b) => {
      const spent = spentMap[b.category] || 0;
      const remaining = Math.max(b.amount - spent, 0);
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return {
        ...b.toObject(),
        spent,
        remaining,
        percentage,
        isOverBudget: spent > b.amount,
        excess: spent > b.amount ? spent - b.amount : 0,
      };
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/budgets - create or update budget
router.post('/', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({ message: 'Category, amount, month, and year are required' });
    }

    const b = await Budget.findOneAndUpdate(
      {
        userId: req.userId,
        category,
        month: Number(month),
        year: Number(year),
      },
      {
        userId: req.userId,
        category,
        amount: Number(amount),
        month: Number(month),
        year: Number(year),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await checkBudgets(req.userId);

    res.status(201).json(b);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/budgets/:id - update existing budget
router.put('/:id', async (req, res) => {
  try {
    const { amount, category } = req.body;
    const update = {};
    if (amount !== undefined) update.amount = Number(amount);
    if (category) update.category = category;

    const b = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!b) return res.status(404).json({ message: 'Budget not found' });

    await checkBudgets(req.userId);
    res.json(b);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Budget.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
