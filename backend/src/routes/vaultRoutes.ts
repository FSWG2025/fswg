import express from "express";
import {
  listVaultDocs,
  registerVaultDoc,
  deleteVaultDoc,
} from "../controllers/vaultController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, listVaultDocs);
router.post("/", protect, registerVaultDoc);
router.delete("/:id", protect, deleteVaultDoc);

export default router;
