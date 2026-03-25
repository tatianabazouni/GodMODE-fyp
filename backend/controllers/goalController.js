import Goal from "../models/Goal.js";
import SharedGoal from "../models/SharedGoal.js";
import { awardXP } from "../services/gamificationService.js";


const CATEGORY_MAP = {
  personal: "Personal",
  health: "Health",
  career: "Career",
  finance: "Finance",
  relationships: "Relationships",
  spiritual: "Spiritual",
  learning: "Learning",
  other: "Other",
};

const normalizeCategory = (category) => {
  if (!category) return "Personal";
  const key = String(category).trim().toLowerCase();
  return CATEGORY_MAP[key] || "Personal";
};
const normalizeSubtask = (subtask, index) => ({
  id: String(subtask?._id || subtask?.id || index),
  title: subtask?.title || subtask?.text || "",
  done: Boolean(subtask?.done ?? subtask?.completed),
});

const normalizeSubtasks = (input = []) =>
  Array.isArray(input)
    ? input
        .filter((item) => (item?.title || item?.text || "").trim())
        .map((item, index) => ({
          title: String(item.title || item.text).trim(),
          done: Boolean(item.done ?? item.completed),
          text: String(item.title || item.text).trim(),
          completed: Boolean(item.done ?? item.completed),
        }))
    : [];

const mapGoal = (goal) => {
  const raw = goal.toObject();
  const subtasks = (raw.subtasks?.length ? raw.subtasks : raw.steps || []).map(normalizeSubtask);
  return {
    ...raw,
    id: raw._id,
    _id: raw._id,
    completed: raw.completed || raw.progress === 100,
    subtasks,
    steps: subtasks.map((st) => ({ text: st.title, completed: st.done })),
  };
};

export const createGoal = async (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ message: "title is required" });
  const goal = await Goal.create({
    user: req.user._id,
    title: req.body.title.trim(),
    description: req.body.description,
    category: normalizeCategory(req.body.category),
    steps: normalizeSubtasks(req.body.subtasks || req.body.steps),
    subtasks: normalizeSubtasks(req.body.subtasks || req.body.steps),
    progress: Number(req.body.progress || 0),
    priority: req.body.priority || "medium",
    xpReward: Number(req.body.xpReward || 50),
    deadline: req.body.deadline,
    fromVision: !!req.body.fromVision,
  });

  await awardXP(req.user._id, "goal_created", "Goal", goal._id);
  res.status(201).json(mapGoal(goal));
};

export const getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(goals.map(mapGoal));
};

export const updateGoal = async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  Object.assign(goal, req.body);
  if (req.body.category) goal.category = normalizeCategory(req.body.category);
  if (req.body.subtasks || req.body.steps) {
    const normalizedSubtasks = normalizeSubtasks(req.body.subtasks || req.body.steps);
    goal.subtasks = normalizedSubtasks;
    goal.steps = normalizedSubtasks;
  }
  if (typeof req.body.completed === "boolean") {
    goal.completed = req.body.completed;
    goal.progress = req.body.completed ? 100 : goal.progress;
  }
  if (goal.progress >= 100 && !goal.completed) goal.completed = true;
  if (goal.completed && !goal.completedAt) goal.completedAt = new Date();

  await goal.save();

  if (goal.completed) {
    await awardXP(req.user._id, "goal_completed", "Goal", goal._id);
  }

  res.json(mapGoal(goal));
};

export const deleteGoal = async (req, res) => {
  await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  await SharedGoal.deleteMany({ goal: req.params.id, owner: req.user._id });
  res.json({ message: "Goal deleted" });
};

export const shareGoal = async (req, res) => {
  const { collaboratorIds = [] } = req.body;
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ message: "Goal not found" });

  const shared = await SharedGoal.findOneAndUpdate(
    { goal: goal._id, owner: req.user._id },
    { $set: { collaborators: collaboratorIds } },
    { new: true, upsert: true }
  );

  res.json(shared);
};
