import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: "VisionBoard" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: String,
    imageUrl: String,
    title: String,
    description: String,
    motivation: { type: String, default: "" },
    emoji: String,
    category: { type: String, enum: ["personal", "travel", "career", "relationships", "health"], default: "personal" },
    targetYear: Number,
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ["dream", "working", "reality"], default: "dream" },
    notes: String,
    progress: { type: Number, default: 0 },
    convertedToGoal: { type: Boolean, default: false },
    achieved: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("VisionItem", itemSchema);