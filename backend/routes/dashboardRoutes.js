import express from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import GoalContribution from '../models/GoalContribution.js';
import RecurringExpense from '../models/RecurringExpense.js';
import Notification from '../models/Notification.js';
import ChatMessage from '../models/ChatMessage.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const allTx = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    const contributions = await GoalContribution.find({ userId: req.userId });
    const totalGoalContributions = contributions.reduce((s, c) => s + c.amount, 0);

    const totalIncome = allTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const availableBalance = Math.max(0, netBalance - totalGoalContributions);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Current month transactions
    const thisMonthTx = allTx.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });

    const monthIncome = thisMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthExpense = thisMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthSavings = monthIncome - monthExpense;
    const savingsRate = monthIncome > 0 ? Math.max(0, Math.round((monthSavings / monthIncome) * 100)) : 0;

    // Previous month transactions for comparison
    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const lastMonth = lastMonthDate.getMonth() + 1;
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthTx = allTx.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const lastMonthExpense = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Category spend for current month
    const categorySpend = {};
    thisMonthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      });

    // Budgets for this month with spent
    const budgets = await Budget.find({ userId: req.userId, month: currentMonth, year: currentYear });
    const budgetList = budgets.map((b) => {
      const spent = categorySpend[b.category] || 0;
      const remaining = Math.max(b.amount - spent, 0);
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining,
        percentage,
        isOverBudget: spent > b.amount,
      };
    });

    // Goals with percentage
    const goals = await Goal.find({ userId: req.userId }).sort({ deadline: 1 });
    const goalList = goals.map((g) => {
      const percentage = g.targetAmount > 0 ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
      return {
        _id: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        savedAmount: g.savedAmount,
        remaining: Math.max(g.targetAmount - g.savedAmount, 0),
        percentage,
        deadline: g.deadline,
      };
    });

    // Recent 6 transactions
    const recent = allTx.slice(0, 6);

    // Rule-based Financial Insights
    const insights = [];

    // 1. Highest spending category
    const catEntries = Object.entries(categorySpend).sort((a, b) => b[1] - a[1]);
    if (catEntries.length > 0) {
      insights.push({
        type: 'category',
        icon: 'trending-up',
        title: `${catEntries[0][0]} is your top expense`,
        description: `You have spent ₹${catEntries[0][1].toLocaleString('en-IN')} on ${catEntries[0][0]} this month (${Math.round((catEntries[0][1] / (monthExpense || 1)) * 100)}% of monthly spend).`,
      });
    }

    // 2. Month-over-month comparison
    if (lastMonthExpense > 0 && monthExpense > 0) {
      const diff = monthExpense - lastMonthExpense;
      const pctChange = Math.abs(Math.round((diff / lastMonthExpense) * 100));
      if (diff > 0) {
        insights.push({
          type: 'warning',
          icon: 'alert-triangle',
          title: `Spending increased by ${pctChange}%`,
          description: `You've spent ₹${diff.toLocaleString('en-IN')} more this month compared to last month.`,
        });
      } else {
        insights.push({
          type: 'positive',
          icon: 'shield-check',
          title: `Spending decreased by ${pctChange}%`,
          description: `Great discipline! You are spending ₹${Math.abs(diff).toLocaleString('en-IN')} less than last month.`,
        });
      }
    }

    // 3. Savings rate insight
    if (monthIncome > 0) {
      if (savingsRate >= 20) {
        insights.push({
          type: 'positive',
          icon: 'sparkles',
          title: `Healthy savings rate of ${savingsRate}%`,
          description: `You have retained ₹${monthSavings.toLocaleString('en-IN')} from your earnings this month.`,
        });
      } else {
        insights.push({
          type: 'neutral',
          icon: 'info',
          title: `Current savings rate is ${savingsRate}%`,
          description: `Target saving at least 20% of your ₹${monthIncome.toLocaleString('en-IN')} monthly income.`,
        });
      }
    }

    // 4. Budget health
    const overBudgets = budgetList.filter((b) => b.isOverBudget);
    if (overBudgets.length > 0) {
      insights.push({
        type: 'danger',
        icon: 'alert-circle',
        title: `${overBudgets.length} budget limit(s) exceeded`,
        description: `Exceeded in: ${overBudgets.map((b) => b.category).join(', ')}. Consider reducing non-essential expenses.`,
      });
    }

    // Notifications preview & unread count
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, read: false });

    // Upcoming recurring bills (within 7 days)
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingRecurring = await RecurringExpense.find({
      userId: req.userId,
      active: true,
      nextDueDate: { $gte: now, $lte: sevenDaysLater },
    }).sort({ nextDueDate: 1 }).limit(3);

    res.json({
      balance: netBalance,
      availableBalance,
      totalGoalContributions,
      totalIncome,
      totalExpense,
      monthIncome,
      monthExpense,
      monthSavings,
      savingsRate,
      categorySpend,
      budgets: budgetList,
      goals: goalList,
      recent,
      insights,
      notifications,
      unreadCount,
      upcomingRecurring,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/analytics - supports dynamic ?month=X&year=Y filtering
router.get('/analytics', async (req, res) => {
  try {
    const allTx = await Transaction.find({ userId: req.userId }).sort({ date: 1 });
    const now = new Date();

    const selectedMonth = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const selectedYear = req.query.year ? Number(req.query.year) : now.getFullYear();

    // Monthly aggregation for past 6 months leading to selected period
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { month: key, label, income: 0, expense: 0, savings: 0 };
    }

    allTx.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount;
        if (t.type === 'expense') monthlyMap[key].expense += t.amount;
      }
    });

    Object.values(monthlyMap).forEach((m) => {
      m.savings = m.income - m.expense;
    });

    // Category breakdown for selected month & year (or all time if month=0)
    let periodExpenses = allTx.filter((t) => t.type === 'expense');
    if (selectedMonth > 0) {
      periodExpenses = periodExpenses.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      });
    }

    const categoryTotals = {};
    let totalSpent = 0;
    periodExpenses.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      totalSpent += t.amount;
    });

    const categoryList = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Selected month budget utilization
    const budgets = await Budget.find({ userId: req.userId, month: selectedMonth, year: selectedYear });

    const monthCatSpent = {};
    periodExpenses.forEach((t) => {
      monthCatSpent[t.category] = (monthCatSpent[t.category] || 0) + t.amount;
    });

    const budgetUtilization = budgets.map((b) => ({
      category: b.category,
      budget: b.amount,
      spent: monthCatSpent[b.category] || 0,
      percentage: b.amount > 0 ? Math.min(100, Math.round(((monthCatSpent[b.category] || 0) / b.amount) * 100)) : 0,
    }));

    const contributions = await GoalContribution.find({ userId: req.userId });
    const totalTransfers = contributions.reduce((s, c) => s + c.amount, 0);

    res.json({
      selectedMonth,
      selectedYear,
      monthly: Object.values(monthlyMap),
      categories: categoryList,
      budgetUtilization,
      totalIncome: allTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      totalExpense: totalSpent,
      totalTransfers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/reports
router.get('/reports', async (req, res) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const tx = await Transaction.find({
      userId: req.userId,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const incomeTx = tx.filter((t) => t.type === 'income');
    const expenseTx = tx.filter((t) => t.type === 'expense');
    const transferTx = tx.filter((t) => t.type === 'transfer');

    const totalIncome = incomeTx.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseTx.reduce((s, t) => s + t.amount, 0);
    const totalTransfers = transferTx.reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const availableSavings = Math.max(0, netSavings - totalTransfers);
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Category breakdown
    const catMap = {};
    expenseTx.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const categories = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Budgets for report period
    const budgets = await Budget.find({ userId: req.userId, month, year });
    const budgetReport = budgets.map((b) => {
      const spent = catMap[b.category] || 0;
      return {
        category: b.category,
        budget: b.amount,
        spent,
        variance: b.amount - spent,
        percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
      };
    });

    // Goals summary
    const goals = await Goal.find({ userId: req.userId });

    res.json({
      month,
      year,
      monthName: start.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      totalIncome,
      totalExpense,
      totalTransfers,
      netSavings,
      availableSavings,
      savingsRate,
      transactionCount: tx.length,
      categories,
      budgetReport,
      goals,
      transactions: tx,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/assistant/history - fetch user chat history
router.get('/assistant/history', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.userId }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/dashboard/assistant/history - clear user chat history
router.delete('/assistant/history', async (req, res) => {
  try {
    await ChatMessage.deleteMany({ userId: req.userId });
    res.json({ message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST & GET /api/dashboard/assistant - intelligent financial assistant with real data & chat persistence
async function handleAssistantQuery(req, res) {
  try {
    const rawQ = String(req.body?.q || req.query?.q || '').trim();
    if (!rawQ) {
      return res.status(400).json({ message: 'Query string is required' });
    }

    const q = rawQ.toLowerCase();
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let answer = '';
    let source = 'SpendWise real data engine';

    // 1. GREETING INTENT (Fixes the bug: "Hi" or "Hello" giving full financial summary)
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'namaste', 'hi spendwise'];
    // Check if message is strictly or essentially a greeting
    const cleanWords = q.replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/);
    const isOnlyGreeting = greetings.includes(cleanWords.join(' ')) || (cleanWords.length <= 2 && greetings.includes(cleanWords[0]));

    if (isOnlyGreeting) {
      if (q.includes('morning')) {
        answer = 'Good morning! How can I assist you with your finances today?';
      } else if (q.includes('afternoon')) {
        answer = 'Good afternoon! How can I assist you with your finances today?';
      } else if (q.includes('evening')) {
        answer = 'Good evening! How can I assist you with your finances today?';
      } else if (cleanWords[0] === 'hello') {
        answer = 'Hello! Ask me about your spending, budgets, savings, or transactions.';
      } else {
        answer = 'Hi! How can I help you with your finances today?';
      }
      source = 'SpendWise Assistant';
    }
    // 2. THANK YOU / CLOSING INTENT
    else if (q === 'thank you' || q === 'thanks' || q === 'thx' || q === 'bye' || q === 'goodbye') {
      answer = "You're welcome! I'm always here to keep your finances clear and organized.";
      source = 'SpendWise Assistant';
    }
    // 3. REAL FINANCIAL DATA INTENTS
    else {
      const [allTx, budgets, goals, recurring, contributions] = await Promise.all([
        Transaction.find({ userId: req.userId }).sort({ date: -1 }),
        Budget.find({ userId: req.userId, month: currentMonth, year: currentYear }),
        Goal.find({ userId: req.userId }),
        RecurringExpense.find({ userId: req.userId, active: true }),
        GoalContribution.find({ userId: req.userId }),
      ]);

      const monthTx = allTx.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      });

      const totalIncome = allTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const totalExpense = allTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const totalContributed = contributions.reduce((s, c) => s + c.amount, 0);
      const netBalance = totalIncome - totalExpense;
      const availableBalance = Math.max(0, netBalance - totalContributed);

      const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const monthExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const monthSavings = monthIncome - monthExpense;

      // Intent: Balance check
      if (q.includes('balance') || q.includes('how much money do i have') || q.includes('net worth')) {
        answer = `Your total recorded net balance is ₹${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Total Income: ₹${totalIncome.toLocaleString('en-IN')} − Total Expenses: ₹${totalExpense.toLocaleString('en-IN')}). Your liquid available balance after goal contributions is ₹${availableBalance.toLocaleString('en-IN')}.`;
      }
      // Intent: Savings reduction simulation (e.g. "How much can I save if I reduce shopping by 20%?")
      else if (q.includes('reduce') || q.includes('cut') || q.includes('save if')) {
        const percentageMatch = q.match(/(\d+)%/);
        const percent = percentageMatch ? parseInt(percentageMatch[1], 10) : 20;

        const knownCats = ['food', 'transport', 'travel', 'shopping', 'bills', 'health', 'education', 'entertainment', 'other'];
        const matchedCat = knownCats.find((c) => q.includes(c));

        if (matchedCat) {
          const catTx = monthTx.filter((t) => t.type === 'expense' && t.category.toLowerCase().includes(matchedCat));
          const catSpent = catTx.reduce((s, t) => s + t.amount, 0);
          const savedAmount = (catSpent * percent) / 100;
          const newTotal = catSpent - savedAmount;

          if (catSpent === 0) {
            answer = `You haven't recorded any ${matchedCat} expenses this month yet.`;
          } else {
            answer = `You spent ₹${catSpent.toLocaleString('en-IN')} on ${matchedCat.charAt(0).toUpperCase() + matchedCat.slice(1)} this month. If you reduce this by ${percent}%, you would save ₹${savedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} per month, lowering your ${matchedCat} expenditure to ₹${newTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`;
          }
        } else {
          const totalSaved = (monthExpense * percent) / 100;
          answer = `Your total monthly spending is ₹${monthExpense.toLocaleString('en-IN')}. Reducing overall expenses by ${percent}% would save you ₹${totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 2 })} this month!`;
        }
      }
      // Intent: Specific category spending (e.g. "How much did I spend on food this month?")
      else if (
        q.includes('food') ||
        q.includes('transport') ||
        q.includes('travel') ||
        q.includes('shopping') ||
        q.includes('bills') ||
        q.includes('health') ||
        q.includes('education') ||
        q.includes('entertainment')
      ) {
        const knownCats = ['food', 'transport', 'travel', 'shopping', 'bills', 'health', 'education', 'entertainment'];
        const matched = knownCats.filter((c) => q.includes(c));
        const targetCat = matched[0];

        const catTx = monthTx.filter((t) => t.type === 'expense' && t.category.toLowerCase().includes(targetCat));
        const catSpent = catTx.reduce((s, t) => s + t.amount, 0);
        const targetBudget = budgets.find((b) => b.category.toLowerCase().includes(targetCat));

        answer = `You have spent ₹${catSpent.toLocaleString('en-IN')} on ${targetCat.charAt(0).toUpperCase() + targetCat.slice(1)} this month across ${catTx.length} transaction(s).`;
        if (targetBudget) {
          const pct = Math.round((catSpent / targetBudget.amount) * 100);
          answer += ` This represents ${pct}% of your ₹${targetBudget.amount.toLocaleString('en-IN')} monthly budget (${catSpent > targetBudget.amount ? `budget exceeded by ₹${(catSpent - targetBudget.amount).toLocaleString('en-IN')}!` : `₹${(targetBudget.amount - catSpent).toLocaleString('en-IN')} remaining`}).`;
        }
      }
      // Intent: Highest / top spending category
      else if (q.includes('highest') || q.includes('most') || q.includes('top category') || q.includes('biggest spend')) {
        const catMap = {};
        monthTx
          .filter((t) => t.type === 'expense')
          .forEach((t) => {
            catMap[t.category] = (catMap[t.category] || 0) + t.amount;
          });
        const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

        if (sorted.length > 0) {
          const [topCat, topAmt] = sorted[0];
          const share = monthExpense > 0 ? Math.round((topAmt / monthExpense) * 100) : 0;
          answer = `Your highest spending category this month is ${topCat} with ₹${topAmt.toLocaleString('en-IN')} (${share}% of your ₹${monthExpense.toLocaleString('en-IN')} total monthly spend).`;
          if (sorted.length > 1) {
            answer += ` Followed by ${sorted[1][0]} at ₹${sorted[1][1].toLocaleString('en-IN')}.`;
          }
        } else {
          answer = 'You do not have any expenses recorded for this month yet.';
        }
      }
      // Intent: Budgets status
      else if (q.includes('budget') || q.includes('limits') || q.includes('over budget')) {
        if (budgets.length === 0) {
          answer = 'You have not configured any budgets for this month yet. Head to the Budgets page to set monthly category guardrails!';
        } else {
          const catMap = {};
          monthTx.filter((t) => t.type === 'expense').forEach((t) => (catMap[t.category] = (catMap[t.category] || 0) + t.amount));
          const statusList = budgets.map((b) => {
            const spent = catMap[b.category] || 0;
            const pct = Math.round((spent / b.amount) * 100);
            return `${b.category}: ${pct}% used (₹${spent.toLocaleString('en-IN')} / ₹${b.amount.toLocaleString('en-IN')})`;
          });
          answer = `Here is your current budget status for this month:\n• ${statusList.join('\n• ')}`;
        }
      }
      // Intent: Goals progress
      else if (q.includes('goal') || q.includes('saving target') || q.includes('progress')) {
        if (goals.length === 0) {
          answer = 'You haven’t created any financial goals yet. Create targets like Emergency Fund or New Laptop from the Goals page!';
        } else {
          const goalStatus = goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.round((g.savedAmount / g.targetAmount) * 100) : 0;
            return `${g.name}: ${pct}% completed (₹${g.savedAmount.toLocaleString('en-IN')} of ₹${g.targetAmount.toLocaleString('en-IN')})`;
          });
          answer = `Here is your savings goal progress:\n• ${goalStatus.join('\n• ')}`;
        }
      }
      // Intent: Upcoming bills & recurring expenses
      else if (q.includes('recurring') || q.includes('subscription') || q.includes('bill') || q.includes('upcoming')) {
        if (recurring.length === 0) {
          answer = 'You have no recurring bills or subscriptions configured.';
        } else {
          const billTotal = recurring.reduce((s, r) => s + r.amount, 0);
          const list = recurring.map(
            (r) => `${r.title}: ₹${r.amount.toLocaleString('en-IN')} (${r.frequency}, next due ${new Date(r.nextDueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`
          );
          answer = `You have ${recurring.length} active recurring expenses totaling ₹${billTotal.toLocaleString('en-IN')}:\n• ${list.join('\n• ')}`;
        }
      }
      // General question fallback with helpful guidance
      else {
        answer = `I can answer questions based on your live financial ledger. Try asking:
• "What is my current balance?"
• "How much did I spend on food this month?"
• "Which category do I spend the most on?"
• "How much can I save if I reduce shopping by 20%?"
• "How are my budgets doing?"
• "What are my upcoming bills?"`;
        source = 'SpendWise Assistant';
      }
    }

    // Persist conversation to MongoDB
    await ChatMessage.create({
      userId: req.userId,
      role: 'user',
      text: rawQ,
    });

    const assistantMsg = await ChatMessage.create({
      userId: req.userId,
      role: 'assistant',
      text: answer,
      source,
    });

    res.json({
      answer,
      source,
      messageId: assistantMsg._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

router.post('/assistant', handleAssistantQuery);
router.get('/assistant', handleAssistantQuery);

export default router;
