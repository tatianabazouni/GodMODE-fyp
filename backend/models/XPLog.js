import mongoose from "mongoose";

const xpLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: String, required: true, index: true },
    points: { type: Number, required: true },
    referenceType: { type: String, required: true },
    referenceId: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

xpLogSchema.index({ user: 1, event: 1, referenceType: 1, referenceId: 1 }, { unique: true });

export default mongoose.model("XPLog", xpLogSchema);
