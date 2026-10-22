import express from "express";
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/secureNoteController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, listNotes);
router.post("/", protect, createNote);
router.patch("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;
