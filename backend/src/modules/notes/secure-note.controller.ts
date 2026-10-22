import type { Response } from "express";
import SecureNote from '../../models/SecureNote';
import type { AuthRequest } from '../../middleware/auth';

// @desc    List secure notes for current user
// @route   GET /api/notes
export const listNotes = async (req: AuthRequest, res: Response) => {
  try {
    const notes = await SecureNote.find({ user: req.user!._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ notes });
  } catch (error) {
    console.error("listNotes:", error);
    res.status(500).json({ message: "Could not load notes" });
  }
};

// @desc    Create a secure note
// @route   POST /api/notes
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const title = String(req.body.title ?? "").slice(0, 200);
    const body = String(req.body.body || "").slice(0, 50000);
    const note = await SecureNote.create({
      user: req.user!._id,
      title,
      body,
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("createNote:", error);
    res.status(500).json({ message: "Could not create note" });
  }
};

// @desc    Update a secure note
// @route   PATCH /api/notes/:id
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await SecureNote.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (typeof req.body.title === "string") {
      // Allow clearing the title while editing — do not force "Untitled note" back
      note.title = req.body.title.slice(0, 200);
    }
    if (typeof req.body.body === "string") {
      note.body = req.body.body.slice(0, 50000);
    }
    await note.save();
    res.json(note);
  } catch (error) {
    console.error("updateNote:", error);
    res.status(500).json({ message: "Could not update note" });
  }
};

// @desc    Delete a secure note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await SecureNote.findOneAndDelete({
      _id: req.params.id,
      user: req.user!._id,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Deleted", id: note._id });
  } catch (error) {
    console.error("deleteNote:", error);
    res.status(500).json({ message: "Could not delete note" });
  }
};
