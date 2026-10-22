import type { Response } from "express";
import VaultDocument from '../../models/VaultDocument';
import type { AuthRequest } from '../../middleware/auth';

// @desc    List vault documents
// @route   GET /api/vault
export const listVaultDocs = async (req: AuthRequest, res: Response) => {
  try {
    const docs = await VaultDocument.find({ user: req.user!._id })
      .sort({ uploadedAt: -1 })
      .lean();
    res.json({ documents: docs });
  } catch (error) {
    console.error("listVaultDocs:", error);
    res.status(500).json({ message: "Could not load documents" });
  }
};

// @desc    Register an UploadThing file in the vault
// @route   POST /api/vault
export const registerVaultDoc = async (req: AuthRequest, res: Response) => {
  try {
    const { name, url, key, size } = req.body;
    if (!name || !url) {
      return res.status(400).json({ message: "name and url are required" });
    }
    const doc = await VaultDocument.create({
      user: req.user!._id,
      name: String(name).slice(0, 255),
      url: String(url),
      key: key ? String(key) : undefined,
      size: typeof size === "number" ? size : undefined,
      uploadedAt: new Date(),
    });
    res.status(201).json(doc);
  } catch (error) {
    console.error("registerVaultDoc:", error);
    res.status(500).json({ message: "Could not save document" });
  }
};

// @desc    Remove vault document record
// @route   DELETE /api/vault/:id
export const deleteVaultDoc = async (req: AuthRequest, res: Response) => {
  try {
    const doc = await VaultDocument.findOneAndDelete({
      _id: req.params.id,
      user: req.user!._id,
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Deleted", id: doc._id });
  } catch (error) {
    console.error("deleteVaultDoc:", error);
    res.status(500).json({ message: "Could not delete document" });
  }
};
