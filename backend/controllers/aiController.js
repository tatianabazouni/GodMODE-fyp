import AIInsight from "../models/AIInsight.js";
import { analyzeLifeTheme, breakdownGoal, motivationalInsight, summarizeJournal } from "../services/aiService.js";

const saveInsight = async (userId, type, prompt, output) => {
  await AIInsight.create({ user: userId, type, prompt, output });
  return output;
};


export const chatAI = async (req, res) => {
  const { message, mode = "chat" } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: "message is required" });

  let output;
  if (mode === "goals" || mode === "priorities") output = await breakdownGoal(message);
  else if (mode === "motivation") output = await motivationalInsight(message);
  else output = await summarizeJournal(message);

  await saveInsight(req.user._id, "motivation", message, output);
  res.json({ message: output });
};

export const journalSummary = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: "content is required" });
  const output = await summarizeJournal(content);
  res.json({ summary: await saveInsight(req.user._id, "journal_summary", content, output) });
};

export const goalBreakdown = async (req, res) => {
  const { vision } = req.body;
  if (!vision?.trim()) return res.status(400).json({ message: "vision is required" });
  const output = await breakdownGoal(vision);
  res.json({ breakdown: await saveInsight(req.user._id, "goal_breakdown", vision, output) });
};

export const motivation = async (req, res) => {
  const { context } = req.body;
  const output = await motivationalInsight(context || "User needs encouragement today.");
  res.json({ motivation: await saveInsight(req.user._id, "motivation", context || "", output) });
};

export const lifeTheme = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: "content is required" });
  const output = await analyzeLifeTheme(content);
  res.json({ theme: await saveInsight(req.user._id, "life_theme", content, output) });
};
