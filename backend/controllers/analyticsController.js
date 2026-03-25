import Goal from "../models/Goal.js";
import JournalEntry from "../models/JournalEntry.js";
import LifeChapter from "../models/LifeChapter.js";
import Memory from "../models/Memory.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  const userId = req.user._id;
  const [user, goals, journals, lifeChapterCount, memoryCount] = await Promise.all([
    User.findById(userId).select("xp level streak"),
    Goal.find({ user: userId }),
    JournalEntry.find({ user: userId }).sort({ createdAt: 1 }),
    LifeChapter.countDocuments({ user: userId }),
    Memory.countDocuments({ user: userId }),
  ]);

  const goalsCompleted = goals.filter((g) => g.completed || g.progress >= 100).length;
  const byCategory = goals.reduce((acc, g) => {
    const key = g.category || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const goalsCompletion = [
    { month: "All", completed: goalsCompleted, total: goals.length || 0 },
  ];

  const moodMap = { sad: 2, neutral: 5, happy: 8 };
  const moodTrends = journals.slice(-30).map((j) => ({
    date: new Date(j.createdAt).toISOString().slice(0, 10),
    score: moodMap[j.mood?.toLowerCase()] || 5,
  }));

  const growth = Object.entries(byCategory).map(([category, value]) => ({ category, value }));

  res.json({
    goalsCompletion,
    moodTrends,
    growth,
    summary: {
      totalEntries: journals.length,
      goalsCompleted,
      streak: user?.streak || 0,
      level: user?.level || 1,
      xp: user?.xp || 0,
      lifeChapterCount,
      memoryCount,
      journalFrequency: journals.length,
    },
  });
};
