import express from "express";
import {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getMyApplications,
} from "../controllers/advisorApplicationController";
import { protect, authorize } from "../middleware/auth";
import { ADMIN_ROLES, NETWORK_ROLES } from "../constants/roles";

const router = express.Router();

// Authenticated users
router.post("/", protect, submitApplication);
router.get("/my", protect, getMyApplications);

// Network managers, mentors, admins
router.get("/", protect, authorize(NETWORK_ROLES), getApplications);
router.get("/:id", protect, authorize(NETWORK_ROLES), getApplicationById);
router.patch("/:id", protect, authorize(NETWORK_ROLES), updateApplication);
router.delete("/:id", protect, authorize(ADMIN_ROLES), deleteApplication);

export default router;
