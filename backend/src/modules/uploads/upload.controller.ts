import { type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { logAudit } from '../../utils/logAudit';

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Multer may store under uploads/images|documents|others
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const relative = path.relative(uploadsRoot, req.file.path).split(path.sep).join("/");
    const fileUrl = `/uploads/${relative}`;

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Uploaded File",
      details: `File: ${req.file.originalname} (${req.file.size} bytes)`,
      req,
    });

    res.json({
      filePath: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadsRoot = path.join(process.cwd(), "uploads");
    const files = (req.files as Express.Multer.File[]).map((file) => {
      const relative = path.relative(uploadsRoot, file.path).split(path.sep).join("/");
      return {
        filePath: `/uploads/${relative}`,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };
    });

    for (const file of req.files as Express.Multer.File[]) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Uploaded Multiple Files",
        details: `File: ${file.originalname} (${file.size} bytes)`,
        req,
      });
    }

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private/Admin
export const deleteFile = async (req: Request, res: Response) => {
  try {
    // Only allow a single basename — never path segments or traversal
    const raw = String(req.params.filename || "");
    const filename = path.basename(raw);
    if (
      !filename ||
      filename === "." ||
      filename === ".." ||
      filename !== raw.replace(/^.*[/\\]/, "")
    ) {
      return res.status(400).json({ message: "Invalid filename" });
    }

    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    const candidates = [
      path.join(uploadsRoot, filename),
      path.join(uploadsRoot, "documents", filename),
      path.join(uploadsRoot, "images", filename),
      path.join(uploadsRoot, "others", filename),
    ];

    const filePath = candidates.find(
      (p) =>
        path.resolve(p).startsWith(uploadsRoot + path.sep) &&
        fs.existsSync(p) &&
        fs.statSync(p).isFile(),
    );

    if (!filePath) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted File",
      details: `File: ${filename}`,
      req,
    });

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};