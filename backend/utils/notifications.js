import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import RecurringExpense from '../models/RecurringExpense.js';

export async function checkBudgets(userId) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ userId, month, year });
    if (!budgets.length) return;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const userObjectId = new mongoose.Types.ObjectId(userId);

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
          total: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = Object.fromEntries(agg.map((x) => [x._id, x.total]));

    for (const b of budgets) {
      const spent = spentMap[b.category] || 0;
      const pct = b.amount > 0 ? spent / b.amount : 0;
      const pctInt = Math.round(pct * 100);

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (pct >= 1) {
        const excess = spent - b.amount;
        const title = `${b.category} budget exceeded`;
        const exists = await Notification.findOne({
          userId,
          title,
          createdAt: { $gte: oneDayAgo },
        });

        if (!exists) {
          await Notification.create({
            userId,
            title,
            message: `You have spent ₹${spent.toLocaleString('en-IN')} against your ₹${b.amount.toLocaleString('en-IN')} budget (exceeded by ₹${excess.toLocaleString('en-IN')}).`,
            type: 'danger',
          });
        }
      } else if (pct >= 0.8) {
        const title = `${b.category} budget is at ${pctInt}%`;
        const exists = await Notification.findOne({
          userId,
          title,
          createdAt: { $gte: oneDayAgo },
        });

        if (!exists) {
          await Notification.create({
            userId,
            title,
            message: `You have used ${pctInt}% of your ${b.category} budget. ₹${Math.max(b.amount - spent, 0).toLocaleString('en-IN')} remaining.`,
            type: 'warning',
          });
        }
      }
    }
  } catch (err) {
    console.error('Error in checkBudgets:', err);
  }
}

export async function checkRecurringReminders(userId) {
  try {
    const now = new Date();
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const recurring = await RecurringExpense.find({
      userId,
      active: true,
      nextDueDate: { $gte: now, $lte: threeDaysLater },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const item of recurring) {
      const title = `Upcoming Bill: ${item.title}`;
      const exists = await Notification.findOne({
        userId,
        title,
        createdAt: { $gte: oneDayAgo },
      });

      if (!exists) {
        const dueFormatted = new Date(item.nextDueDate).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        });
        await Notification.create({
          userId,
          title,
          message: `Your payment of ₹${item.amount.toLocaleString('en-IN')} for ${item.title} is due on ${dueFormatted}.`,
          type: 'info',
        });
      }
    }
  } catch (err) {
    console.error('Error in checkRecurringReminders:', err);
  }
}
