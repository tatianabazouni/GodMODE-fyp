import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getGamificationSnapshot } from "../services/gamificationService.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const data = await getGamificationSnapshot(req.user._id);
  res.json({
    xp: data.user?.xp || 0,
    level: data.user?.level || 1,
    badges: data.user?.badges || [],
    streak: data.user?.streak || 0,
    history: data.history,
  });
});

export default router;
