import mongoose from "mongoose";

const aiInsightSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, enum: ["journal_summary", "goal_breakdown", "motivation", "life_theme"] },
    prompt: { type: String, required: true },
    output: { type: String, required: true },
  },
  { timestamps: true }
);

aiInsightSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.model("AIInsight", aiInsightSchema);
