import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import lifeRoutes from "./routes/lifeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import dailyPhotoRoutes from "./routes/dailyPhotoRoutes.js";
import visionRoutes from "./routes/visionRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

connectDB();

const app = express();

/* ===========================
   PRODUCTION SAFE CORS SETUP
=========================== */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("❌ CORS BLOCKED:", origin);
    return callback(new Error("CORS not allowed"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ===========================
   BODY PARSING
=========================== */

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===========================
   ROUTES
=========================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/life", lifeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/daily-photo", dailyPhotoRoutes);
app.use("/api", visionRoutes);
app.use("/api", connectionRoutes);

/* ===========================
   ROOT
=========================== */

app.get("/", (req, res) => res.send("LifeOS API running"));

/* ===========================
   ERROR HANDLERS
=========================== */

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});