import LifeCapsule from "../models/LifeCapsule.js";
import LifeChapter from "../models/LifeChapter.js";
import Memory from "../models/Memory.js";
import { awardXP } from "../services/gamificationService.js";

const mapMemory = (memory) => ({ ...memory.toObject(), id: memory._id, chapterId: memory.chapter, imageUrl: memory.mediaUrl, image: memory.mediaUrl });

const ensureCapsule = async (userId) => {
  return LifeCapsule.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { title: "My Life Capsule", description: "" } },
    { new: true, upsert: true }
  );
};

export const getChapters = async (req, res) => {
  const capsule = await ensureCapsule(req.user._id);
  const chapters = await LifeChapter.find({ user: req.user._id }).sort({ createdAt: -1 });
  const memories = await Memory.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });

  res.json(
    chapters.map((chapter) => ({
      ...chapter.toObject(),
      id: chapter._id,
      capsuleId: capsule._id,
      dateRange: [chapter.startDate, chapter.endDate].filter(Boolean).join(" - "),
      memories: memories.filter((m) => String(m.chapter) === String(chapter._id)).map(mapMemory),
    }))
  );
};

export const createChapter = async (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ message: "title is required" });
  const capsule = await ensureCapsule(req.user._id);
  const chapter = await LifeChapter.create({
    title: req.body.title.trim(),
    icon: req.body.icon || "📝",
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    user: req.user._id,
    lifeCapsule: capsule._id,
  });
  res.status(201).json({ ...chapter.toObject(), id: chapter._id, memories: [] });
};

export const updateChapter = async (req, res) => {
  const chapter = await LifeChapter.findOne({ _id: req.params.id, user: req.user._id });
  if (!chapter) return res.status(404).json({ message: "Chapter not found" });
  Object.assign(chapter, req.body);
  await chapter.save();
  res.json({ ...chapter.toObject(), id: chapter._id });
};

export const deleteChapter = async (req, res) => {
  await LifeChapter.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  await Memory.deleteMany({ chapter: req.params.id, user: req.user._id });
  res.json({ message: "Chapter deleted" });
};

export const getMemories = async (req, res) => {
  const memories = await Memory.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
  res.json(memories.map(mapMemory));
};

export const createMemory = async (req, res) => {
  let chapterId = req.body.chapterId || req.body.chapter;
  let chapter = chapterId
    ? await LifeChapter.findOne({ _id: chapterId, user: req.user._id })
    : null;

  if (!chapter) {
    const capsule = await ensureCapsule(req.user._id);
    chapter = await LifeChapter.findOneAndUpdate(
      { user: req.user._id, title: "Unsorted Memories" },
      {
        $setOnInsert: {
          title: "Unsorted Memories",
          icon: "🧠",
          lifeCapsule: capsule._id,
        },
      },
      { upsert: true, new: true }
    );
    chapterId = chapter._id;
  }

  const memory = await Memory.create({
    user: req.user._id,
    chapter: chapterId,
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    mediaUrl: req.body.mediaUrl || req.body.imageUrl || req.body.image,
    date: req.body.date,
    location: req.body.location,
    people: req.body.people,
    emotion: req.body.emotion,
    tags: req.body.tags,
  });

  await awardXP(req.user._id, "memory_uploaded", "Memory", memory._id);
  res.status(201).json(mapMemory(memory));
};

export const updateMemory = async (req, res) => {
  const memory = await Memory.findOne({ _id: req.params.id, user: req.user._id });
  if (!memory) return res.status(404).json({ message: "Memory not found" });
  Object.assign(memory, req.body);
  await memory.save();
  res.json(mapMemory(memory));
};

export const deleteMemory = async (req, res) => {
  await Memory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Memory deleted" });
};
