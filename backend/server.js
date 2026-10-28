import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import recurringRoutes from './routes/recurringRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Prevent transient connection or network glitches from crashing server
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection caught:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught:', err);
});

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, app: 'SpendWise' }));

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const port = process.env.PORT || 5001;

const server = app.listen(port, () => console.log(`SpendWise API running on port ${port}`));

async function startDB() {
  try {
    await connectDB();
  } catch (e) {
    console.error('Initial MongoDB connection error (will retry):', e?.message || e);
    setTimeout(startDB, 5000);
  }
}
startDB();

