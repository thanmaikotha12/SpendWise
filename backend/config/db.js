import mongoose from 'mongoose';

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err?.message || err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected. Reconnecting...');
  });

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  });

  console.log('MongoDB connected successfully');
}
