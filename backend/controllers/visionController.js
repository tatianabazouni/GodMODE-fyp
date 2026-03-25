import VisionBoard from "../models/VisionBoard.js";
import VisionItem from "../models/VisionItem.js";
import Goal from "../models/Goal.js";
import { awardXP } from "../services/gamificationService.js";

export const getBoards = async (req, res) => {
  const boards = await VisionBoard.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(boards.map((board) => ({ ...board.toObject(), id: board._id })));
};

export const createBoard = async (req, res) => {
  const board = await VisionBoard.create({
    title: req.body.title,
    isPublic: !!req.body.isPublic,
    user: req.user._id,
  });
  res.status(201).json({ ...board.toObject(), id: board._id });
};

export const deleteBoard = async (req, res) => {
  const board = await VisionBoard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  await VisionItem.deleteMany({ board: board._id, user: req.user._id });
  return res.json({ message: "Board deleted" });
};

export const getVisionItems = async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.boardId) {
    query.board = req.query.boardId;
  }

  const items = await VisionItem.find(query).sort({ createdAt: -1 });
  res.json(items.map((item) => ({ ...item.toObject(), id: item._id, boardId: item.board, imageUrl: item.imageUrl || item.image })));
};

export const createVisionItem = async (req, res) => {
  const item = await VisionItem.create({
    user: req.user._id,
    board: req.body.boardId,
    title: req.body.title,
    description: req.body.description,
    motivation: req.body.motivation,
    emoji: req.body.emoji,
    category: req.body.category || "personal",
    targetYear: req.body.targetYear,
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    imageUrl: req.body.imageUrl || req.body.image,
    image: req.body.image || req.body.imageUrl,
    convertedToGoal: !!req.body.convertedToGoal,
    achieved: !!req.body.achieved,
    order: Number(req.body.order || 0),
    status: req.body.status || "dream",
    progress: req.body.progress || 0,
  });

  res.status(201).json({ ...item.toObject(), id: item._id, boardId: item.board, imageUrl: item.imageUrl || item.image });
};

export const updateVisionItem = async (req, res) => {
  const item = await VisionItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  Object.assign(item, req.body);
  if (req.body.image || req.body.imageUrl) {
    item.imageUrl = req.body.imageUrl || req.body.image;
    item.image = req.body.image || req.body.imageUrl;
  }
  await item.save();

  res.json({ ...item.toObject(), id: item._id, boardId: item.board, imageUrl: item.imageUrl || item.image });
};

export const deleteVisionItem = async (req, res) => {
  const item = await VisionItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.json({ message: "Item deleted" });
};

export const convertToGoal = async (req, res) => {
  const item = await VisionItem.findOne({ _id: req.params.id, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  const goal = await Goal.create({
    user: req.user._id,
    title: item.title,
    description: item.description,
    fromVision: true,
    category: "Personal",
    deadline: item.targetYear ? new Date(`${item.targetYear}-12-31`) : undefined,
  });

  item.convertedToGoal = true;
  await item.save();

  await awardXP(req.user._id, "goal_created", "Goal", goal._id);
  res.status(201).json({ ...goal.toObject(), id: goal._id, fromVisionItemId: item._id });
};
