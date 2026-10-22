import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToClient,
  bulkAssignLeads,
} from "../controllers/leadController";
import { protect, authorize, rateLimiter } from "../middleware/auth";
import {
  ADMIN_ROLES,
  LEAD_BULK_ROLES,
  LEAD_ROLES,
} from "../constants/roles";

const router = express.Router();

// Public route - anyone can submit a lead (rate-limited against spam)
router.post("/", rateLimiter(8, 60), createLead);

// Protected routes
router.get("/", protect, authorize(LEAD_ROLES), getLeads);
router.get("/:id", protect, authorize(LEAD_ROLES), getLeadById);
router.patch("/:id", protect, authorize(LEAD_ROLES), updateLead);
router.delete("/:id", protect, authorize(ADMIN_ROLES), deleteLead);

// Special operations
router.patch("/:id/convert", protect, authorize(LEAD_ROLES), convertLeadToClient);
router.patch("/bulk/assign", protect, authorize(LEAD_BULK_ROLES), bulkAssignLeads);

export default router;
