import JournalEntry from "../models/JournalEntry.js";
import { awardXP } from "../services/gamificationService.js";

export const createJournal = async (req, res) => {
  if (!req.body.content?.trim()) return res.status(400).json({ message: "content is required" });

  const entry = await JournalEntry.create({
    user: req.user._id,
    title: req.body.title,
    content: req.body.content,
    mood: req.body.mood,
    tags: req.body.tags,
    date: req.body.date,
  });

  await awardXP(req.user._id, "journal_created", "JournalEntry", entry._id);
  res.status(201).json(entry);
};

export const getJournal = async (req, res) => {
  const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(entries);
};

export const updateJournal = async (req, res) => {
  const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  Object.assign(entry, req.body);
  await entry.save();
  res.json(entry);
};

export const deleteJournal = async (req, res) => {
  const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json({ message: "Entry deleted" });
};
