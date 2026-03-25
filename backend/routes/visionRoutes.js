import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getBoards,
  createBoard,
  deleteBoard,
  getVisionItems,
  createVisionItem,
  updateVisionItem,
  deleteVisionItem,
  convertToGoal,
} from "../controllers/visionController.js";

const router = express.Router();

router.route("/boards").get(protect, getBoards).post(protect, createBoard);
router.route("/boards/:id").delete(protect, deleteBoard);

router.route("/vision-items").get(protect, getVisionItems).post(protect, createVisionItem);
router.route("/vision-items/:id").put(protect, updateVisionItem).delete(protect, deleteVisionItem);
router.post("/vision-items/:id/convert-to-goal", protect, convertToGoal);

export default router;
