import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, trim: true, maxlength: 140, default: "" },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    mood: { type: String, trim: true, maxlength: 40, default: "neutral" },
    tags: [{ type: String, trim: true, maxlength: 40 }],
    date: { type: Date, default: Date.now, index: true },
    aiFeedback: { type: String, default: "" },
  },
  { timestamps: true }
);

journalEntrySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("JournalEntry", journalEntrySchema);
