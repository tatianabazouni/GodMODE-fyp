import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  achievedAt: { type: Date, default: Date.now }
});

export const Achievement = mongoose.model("Achievement", schema);
