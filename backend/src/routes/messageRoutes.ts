import express from "express";
import {
  getMessages,
  markMessagesRead,
  sendMessage,
} from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, getMessages);
router.post("/", protect, sendMessage);
router.patch("/read", protect, markMessagesRead);

export default router;
