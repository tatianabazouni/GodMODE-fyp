import mongoose from "mongoose";

const sharedGoalSchema = new mongoose.Schema(
  {
    goal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

sharedGoalSchema.index({ goal: 1, owner: 1 }, { unique: true });

export default mongoose.model("SharedGoal", sharedGoalSchema);
