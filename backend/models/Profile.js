import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    bio: { type: String, trim: true, maxlength: 300, default: "" },
    birthDate: Date,
    timezone: { type: String, default: "UTC" },
    interests: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
