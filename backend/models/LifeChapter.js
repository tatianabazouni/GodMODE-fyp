import mongoose from "mongoose";

const lifeChapterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lifeCapsule: { type: mongoose.Schema.Types.ObjectId, ref: "LifeCapsule" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    icon: { type: String, default: "📝" },
    startDate: Date,
    endDate: Date,
    isTemplate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lifeChapterSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("LifeChapter", lifeChapterSchema);
