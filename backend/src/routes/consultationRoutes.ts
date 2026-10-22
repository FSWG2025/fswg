import express from "express";
import {
  bookConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  cancelConsultation,
  getConsultationStats,
} from "../controllers/consultationController";
import { protect, authorize } from "../middleware/auth";
import { CRM_ROLES } from "../constants/roles";

const router = express.Router();

router.use(protect);

router.post("/", bookConsultation);
router.get("/", getConsultations);
router.get("/stats", authorize(CRM_ROLES), getConsultationStats);
router.get("/:id", getConsultationById);
router.patch("/:id", updateConsultation);
router.delete("/:id", cancelConsultation);

export default router;
