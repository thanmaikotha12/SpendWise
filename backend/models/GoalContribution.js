import mongoose from 'mongoose';

const goalContributionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('GoalContribution', goalContributionSchema);
