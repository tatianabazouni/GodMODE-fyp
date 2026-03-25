import express from "express";
import protect from "../middleware/authMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";
import { chatAI, goalBreakdown, journalSummary, lifeTheme, motivation } from "../controllers/aiController.js";

const router = express.Router();
const aiLimiter = rateLimit({ windowMs: 60_000, max: 15 });

router.post("/chat", protect, aiLimiter, chatAI);
router.post("/journal-summary", protect, aiLimiter, journalSummary);
router.post("/goal-breakdown", protect, aiLimiter, goalBreakdown);
router.post("/motivation", protect, aiLimiter, motivation);
router.post("/life-theme", protect, aiLimiter, lifeTheme);

export default router;
