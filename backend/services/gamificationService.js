import User from "../models/User.js";
import XPLog from "../models/XPLog.js";

const EVENT_POINTS = {
  goal_created: 15,
  goal_completed: 60,
  journal_created: 10,
  memory_uploaded: 12,
  daily_photo_uploaded: 5,
};

const BADGES = [
  { key: "first_steps", title: "First Steps", description: "Earn 50 XP", thresholdXP: 50 },
  { key: "goal_getter", title: "Goal Getter", description: "Earn 200 XP", thresholdXP: 200 },
  { key: "life_master", title: "Life Master", description: "Earn 500 XP", thresholdXP: 500 },
];

export const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 25)) + 1;

export const awardXP = async (userId, event, referenceType, referenceId, metadata = {}) => {
  const points = EVENT_POINTS[event] ?? 0;
  if (!points) return { awarded: false, reason: "No points configured" };

  const existing = await XPLog.findOne({ user: userId, event, referenceType, referenceId });
  if (existing) return { awarded: false, reason: "Duplicate award prevented" };

  await XPLog.create({ user: userId, event, points, referenceType, referenceId: String(referenceId), metadata });

  const user = await User.findById(userId);
  if (!user) return { awarded: false, reason: "User not found" };

  user.xp += points;
  user.level = calculateLevel(user.xp);

  for (const badge of BADGES) {
    if (user.xp >= badge.thresholdXP && !user.badges.includes(badge.key)) {
      user.badges.push(badge.key);
    }
  }

  await user.save();

  return { awarded: true, points, xp: user.xp, level: user.level, badges: user.badges };
};

export const getGamificationSnapshot = async (userId) => {
  const user = await User.findById(userId).select("xp level streak badges");
  const history = await XPLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
  return { user, history };
};
