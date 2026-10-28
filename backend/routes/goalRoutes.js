import express from 'express';
import Goal from '../models/Goal.js';
import GoalContribution from '../models/GoalContribution.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// Helper for milestone notifications
async function checkGoalMilestone(userId, goal) {
  try {
    const pct = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
    if (pct >= 100) {
      await Notification.create({
        userId,
        title: `Goal Achieved: ${goal.name}! 🎉`,
        message: `Congratulations! You reached 100% of your ₹${goal.targetAmount.toLocaleString('en-IN')} target for ${goal.name}.`,
        type: 'success',
      });
    } else if (pct >= 50) {
      const exists = await Notification.findOne({
        userId,
        title: `Goal Halfway Milestone: ${goal.name}`,
      });
      if (!exists) {
        await Notification.create({
          userId,
          title: `Goal Halfway Milestone: ${goal.name}`,
          message: `Awesome work! You are now over 50% on your goal '${goal.name}' (₹${goal.savedAmount.toLocaleString('en-IN')} saved).`,
          type: 'info',
        });
      }
    }
  } catch (e) {
    console.error('Milestone check error:', e);
  }
}

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const items = await Goal.find({ userId: req.userId }).sort({ deadline: 1, createdAt: -1 });

    // Calculate current available balance for frontend contribution validation
    const tx = await Transaction.find({ userId: req.userId });
    const totalIncome = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const contributions = await GoalContribution.find({ userId: req.userId });
    const totalContributions = contributions.reduce((s, c) => s + c.amount, 0);
    const availableBalance = Math.max(0, totalIncome - totalExpense - totalContributions);

    const formatted = items.map((g) => {
      const percentage = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
      const remaining = Math.max(g.targetAmount - g.savedAmount, 0);
      return {
        ...g.toObject(),
        percentage,
        remaining,
        isCompleted: g.savedAmount >= g.targetAmount,
      };
    });

    res.json({ goals: formatted, availableBalance, totalContributions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/goals - create goal
router.post('/', async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, currentAmount, deadline } = req.body;
    if (!name || !targetAmount) {
      return res.status(400).json({ message: 'Name and target amount are required' });
    }

    const initSaved = Number(savedAmount !== undefined ? savedAmount : currentAmount || 0);

    // If starting with saved amount, check available balance
    if (initSaved > 0) {
      const tx = await Transaction.find({ userId: req.userId });
      const totalIncome = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const contributions = await GoalContribution.find({ userId: req.userId });
      const totalContributions = contributions.reduce((s, c) => s + c.amount, 0);
      const availableBalance = totalIncome - totalExpense - totalContributions;

      if (initSaved > availableBalance) {
        return res.status(400).json({
          message: `Initial contribution of ₹${initSaved.toLocaleString('en-IN')} exceeds your available balance of ₹${Math.max(0, availableBalance).toLocaleString('en-IN')}`,
        });
      }
    }

    const goal = await Goal.create({
      userId: req.userId,
      name: name.trim(),
      targetAmount: Number(targetAmount),
      savedAmount: initSaved,
      deadline: deadline ? new Date(deadline) : undefined,
    });

    if (initSaved > 0) {
      await GoalContribution.create({
        userId: req.userId,
        goalId: goal._id,
        amount: initSaved,
        date: new Date(),
      });
      await Transaction.create({
        userId: req.userId,
        title: `Savings Goal Contribution — ${goal.name}`,
        amount: initSaved,
        type: 'transfer',
        category: 'Investments',
        paymentMethod: 'Goal Allocation',
        date: new Date(),
        description: `Initial contribution allocated to savings goal: ${goal.name}`,
      });
      await checkGoalMilestone(req.userId, goal);
    }

    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/goals/:id - edit goal
router.put('/:id', async (req, res) => {
  try {
    const { name, targetAmount, deadline } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (targetAmount !== undefined) update.targetAmount = Number(targetAmount);
    if (deadline !== undefined) update.deadline = deadline ? new Date(deadline) : null;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/goals/:id/contribute - real money contribution from available balance
router.post('/:id/contribute', async (req, res) => {
  try {
    const { amount } = req.body;
    const contributeAmt = Number(amount);
    if (isNaN(contributeAmt) || contributeAmt <= 0) {
      return res.status(400).json({ message: 'Please provide a valid positive contribution amount' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Validate available balance
    const tx = await Transaction.find({ userId: req.userId });
    const totalIncome = tx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prevContributions = await GoalContribution.find({ userId: req.userId });
    const totalContributed = prevContributions.reduce((s, c) => s + c.amount, 0);
    const availableBalance = totalIncome - totalExpense - totalContributed;

    if (contributeAmt > availableBalance) {
      return res.status(400).json({
        message: `Insufficient available funds. You have ₹${Math.max(0, availableBalance).toLocaleString('en-IN')} available to allocate.`,
      });
    }

    // Record the contribution transfer
    await GoalContribution.create({
      userId: req.userId,
      goalId: goal._id,
      amount: contributeAmt,
      date: new Date(),
    });

    await Transaction.create({
      userId: req.userId,
      title: `Savings Goal Contribution — ${goal.name}`,
      amount: contributeAmt,
      type: 'transfer',
      category: 'Investments',
      paymentMethod: 'Goal Allocation',
      date: new Date(),
      description: `Contribution allocated to savings goal: ${goal.name}`,
    });

    goal.savedAmount = (goal.savedAmount || 0) + contributeAmt;
    await goal.save();

    await checkGoalMilestone(req.userId, goal);

    res.json({
      message: `Successfully contributed ₹${contributeAmt.toLocaleString('en-IN')} to '${goal.name}'`,
      goal,
      newAvailableBalance: availableBalance - contributeAmt,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.deleteOne({ _id: req.params.id, userId: req.userId });

    // Release allocated contributions back to available balance
    await GoalContribution.deleteMany({ goalId: req.params.id, userId: req.userId });

    // Clean up corresponding goal contribution transactions
    await Transaction.deleteMany({
      userId: req.userId,
      title: `Savings Goal Contribution — ${goal.name}`,
    });

    res.json({ message: 'Goal deleted and allocated funds returned to available balance' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
