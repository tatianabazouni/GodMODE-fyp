import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // 🔥 FORCE IPv4 (CRITICAL FOR YOUR ERROR)
      serverSelectionTimeoutMS: 5000, // fail fast
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MONGO CONNECTION ERROR:");
    console.error(error.message); // cleaner output
    process.exit(1);
  }
};

export default connectDB;