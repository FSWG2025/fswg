import express from "express";
import {
  createContent,
  getContent,
  getContentBySlug,
  getContentById,
  updateContent,
  deleteContent,
  getContentTypes,
} from "../controllers/contentController";
import { protect, authorize, optionalAuth } from "../middleware/auth";
import { CONTENT_ROLES } from "../constants/roles";

const router = express.Router();

// Public routes (with optional auth for admin preview)
router.get("/", optionalAuth, getContent);
router.get("/types", getContentTypes);
router.get("/:slug", optionalAuth, getContentBySlug);

// Content editor + admin
router.post("/", protect, authorize(CONTENT_ROLES), createContent);
router.get("/id/:id", protect, authorize(CONTENT_ROLES), getContentById);
router.patch("/:id", protect, authorize(CONTENT_ROLES), updateContent);
router.delete("/:id", protect, authorize(CONTENT_ROLES), deleteContent);

export default router;
