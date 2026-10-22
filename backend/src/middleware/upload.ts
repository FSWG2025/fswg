import multer from "multer";
import path from "path";
import fs from "fs";
import { type Request } from "express";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const documentsDir = path.join(uploadsDir, "documents");
const imagesDir = path.join(uploadsDir, "images");
const othersDir = path.join(uploadsDir, "others");

[documentsDir, imagesDir, othersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// @desc    Determine upload directory based on file type
const getDestination = (file: Express.Multer.File): string => {
  const ext = path.extname(file.originalname).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
    return imagesDir;
  }

  if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"].includes(ext)) {
    return documentsDir;
  }

  return othersDir;
};

// @desc    Generate unique filename
const generateFilename = (file: Express.Multer.File): string => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = path.extname(file.originalname);
  const name = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9]/g, "-")
    .toLowerCase();

  return `${name}-${uniqueSuffix}${ext}`;
};

// @desc    Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = getDestination(file);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  },
});

// @desc    File filter - only allow specific file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  // SVG deliberately excluded: public /uploads/images would enable stored XSS
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP`
      )
    );
  }
};

// @desc    General upload middleware (single file)
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB — vault docs + images
  },
  fileFilter: fileFilter,
});

// @desc    Image upload middleware (images only, larger size)
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: (req, file, cb) => {
    const imageMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid image type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP`
        )
      );
    }
  },
});

// @desc    Document upload middleware — PDF only
export const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB for documents
  },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPdf) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents are allowed"));
    }
  },
});

// @desc    Avatar upload middleware (profile pictures only)
export const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
  },
  fileFilter: (req, file, cb) => {
    const imageMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid avatar type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`
        )
      );
    }
  },
});

// @desc    Error handler for multer errors
export const handleMulterError = (
  err: any,
  req: Request,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File too large",
        error: `Maximum file size is ${
          err.field === "avatar" ? "2MB" : "5MB"
        }`,
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Too many files",
        error: "Maximum number of files exceeded",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "Unexpected file field",
        error: `Field '${err.field}' is not expected`,
      });
    }

    return res.status(400).json({
      message: "Upload error",
      error: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      message: "Upload error",
      error: err.message,
    });
  }

  next();
};

// @desc    Delete file helper
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to delete file: ${filePath}`, error);
    return false;
  }
};

// @desc    Get file URL helper
export const getFileUrl = (filename: string): string => {
  // Check which subdirectory the file is in
  const subdirs = ["documents", "images", "others", ""];

  for (const subdir of subdirs) {
    const filePath = subdir
      ? path.join(uploadsDir, subdir, filename)
      : path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      const relativePath = subdir
        ? `/uploads/${subdir}/${filename}`
        : `/uploads/${filename}`;
      return relativePath;
    }
  }

  return `/uploads/${filename}`;
};