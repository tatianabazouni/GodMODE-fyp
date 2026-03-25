import express from "express";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Goal from "../models/Goal.js";
import JournalEntry from "../models/JournalEntry.js";
import LifeChapter from "../models/LifeChapter.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const [user, goals, journals, lifeChapterCount] = await Promise.all([
    User.findById(req.user._id),
    Goal.find({ user: req.user._id }).sort({ updatedAt: -1 }),
    JournalEntry.find({ user: req.user._id }).sort({ updatedAt: -1 }),
    LifeChapter.countDocuments({ user: req.user._id }),
  ]);

  const completedGoals = goals.filter((g) => g.completed || g.progress >= 100).length;
  const recentActivity = [
    ...goals.slice(0, 5).map((g) => ({ id: g._id, type: "goal", title: g.title, date: g.updatedAt })),
    ...journals.slice(0, 5).map((j) => ({ id: j._id, type: "journal", title: j.title || "Journal entry", date: j.updatedAt })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  res.json({
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
    xpToNext: Math.max(0, (user?.level || 1) * 100 - (user?.xp || 0)),
    goalsCompleted: completedGoals,
    goalsTotal: goals.length,
    journalCount: journals.length,
    lifeChapterCount,
    recentActivity,
  });
});

export default router;
