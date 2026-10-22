import express from "express";
import {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
} from "../controllers/uploadController";
import { upload, uploadImage, uploadDocument, handleMulterError } from "../middleware/upload";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// Single file upload
router.post(
  "/",
  upload.single("file"),
  handleMulterError,
  uploadFile
);

// Multiple files upload
router.post(
  "/multiple",
  upload.array("files", 5),
  handleMulterError,
  uploadMultipleFiles
);

// Image upload
router.post(
  "/image",
  uploadImage.single("image"),
  handleMulterError,
  uploadFile
);

// Document upload
router.post(
  "/document",
  uploadDocument.single("document"),
  handleMulterError,
  uploadFile
);

// Delete file (admin only)
router.delete("/:filename", authorize(["admin"]), deleteFile);

export default router;