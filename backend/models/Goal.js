import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, default: "" },
    category: {
      type: String,
      trim: true,
      enum: ["Personal", "Health", "Career", "Finance", "Relationships", "Spiritual", "Learning", "Other"],
      default: "Personal",
    },
    steps: [
      {
        text: { type: String, trim: true, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    subtasks: [
      {
        title: { type: String, trim: true, required: true },
        done: { type: Boolean, default: false },
      },
    ],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    xpReward: { type: Number, min: 0, default: 50 },
    deadline: Date,
    completed: { type: Boolean, default: false, index: true },
    fromVision: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ user: 1, completed: 1 });

export default mongoose.model("Goal", goalSchema);
