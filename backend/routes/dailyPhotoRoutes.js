import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createDailyPhoto, getDailyPhoto } from "../controllers/dailyPhotoController.js";

const router = express.Router();

router.route("/").get(protect, getDailyPhoto).post(protect, createDailyPhoto);

export default router;
