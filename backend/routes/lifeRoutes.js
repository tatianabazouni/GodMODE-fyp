import express from "express";
import  protect  from "../middleware/authMiddleware.js";
import {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory
} from "../controllers/lifeController.js";

const router = express.Router();

router.route("/chapters")
  .get(protect, getChapters)
  .post(protect, createChapter);

router.route("/chapters/:id")
  .put(protect, updateChapter)
  .delete(protect, deleteChapter);

router.route("/memories")
  .get(protect, getMemories)
  .post(protect, createMemory);

router.route("/memories/:id")
  .put(protect, updateMemory)
  .delete(protect, deleteMemory);

export default router;