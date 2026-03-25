import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  listConnections,
  searchUsers,
  requestConnection,
  acceptConnection,
  declineConnection,
} from "../controllers/connectionController.js";

const router = express.Router();

router.get("/connections", protect, listConnections);
router.get("/connections/users/search", protect, searchUsers);
router.post("/connections/request", protect, requestConnection);
router.put("/connections/accept", protect, acceptConnection);
router.put("/connections/decline", protect, declineConnection);

export default router;
