import express from "express";
import {
  createJournal,
  getJournal,
  updateJournal,
  deleteJournal,
} from "../controllers/journalController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createJournal).get(protect, getJournal);
router.route("/:id").put(protect, updateJournal).delete(protect, deleteJournal);

export default router;
