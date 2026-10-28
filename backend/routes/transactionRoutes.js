import express from 'express';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
import { checkBudgets } from '../utils/notifications.js';
import { ALL_CATEGORIES } from '../utils/categories.js';

const router = express.Router();
router.use(auth);

// GET /api/transactions - fetch all or filtered transactions
router.get('/', async (req, res) => {
  try {
    const { type, category, search, startDate, endDate, sort } = req.query;

    const query = { userId: req.userId };

    if (type && ['income', 'expense', 'transfer'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { category: regex }, { paymentMethod: regex }];
    }

    // Inclusive Date Filtering:
    // From date starts at 00:00:00.000
    // To date ends at 23:59:59.999
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    let sortOption = { date: -1, createdAt: -1 };
    if (sort === 'date_asc') sortOption = { date: 1, createdAt: 1 };
    else if (sort === 'amount_desc') sortOption = { amount: -1 };
    else if (sort === 'amount_asc') sortOption = { amount: 1 };

    const items = await Transaction.find(query).sort(sortOption);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/transactions/:id - single transaction
router.get('/:id', async (req, res) => {
  try {
    const item = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: 'Transaction not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions - create transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, description } = req.body;
    if (!title || !amount || !type || !category) {
      return res.status(400).json({ message: 'Title, amount, type, and category are required' });
    }

    const item = await Transaction.create({
      userId: req.userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'Cash',
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
    });

    if (type === 'expense') {
      await checkBudgets(req.userId);
    }

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/transactions/:id - edit/update transaction
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, description } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (date !== undefined) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description.trim();

    const item = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ message: 'Transaction not found' });

    if (item.type === 'expense') {
      await checkBudgets(req.userId);
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id - delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const result = await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    await checkBudgets(req.userId);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
