import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", index: true },
  image: { type: String, required: true },
  caption: String
}, { timestamps: true });

export const Vision = mongoose.model("Vision", schema);
