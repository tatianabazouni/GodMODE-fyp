import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    xpReward: { type: Number, default: 100, min: 0 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", challengeSchema);
