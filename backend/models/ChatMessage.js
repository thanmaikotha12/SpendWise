import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    text: { type: String, required: true },
    source: { type: String, default: 'SpendWise real data engine' },
  },
  { timestamps: true }
);

export default mongoose.model('ChatMessage', chatMessageSchema);
