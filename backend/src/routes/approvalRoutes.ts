import express from "express";
import {
  listApprovals,
  createApproval,
  approveRequest,
  rejectRequest,
  cancelRequest,
  pendingCount,
} from "../modules/approvals/approval.controller";
import { protect, authorize } from "../middleware/auth";
import { ADMIN_ROLES } from "../constants/roles";

const router = express.Router();

router.use(protect);

router.get("/pending-count", authorize(ADMIN_ROLES), pendingCount);
router.get("/", listApprovals);
router.post("/", createApproval);
router.patch("/:id/approve", authorize(ADMIN_ROLES), approveRequest);
router.patch("/:id/reject", authorize(ADMIN_ROLES), rejectRequest);
router.delete("/:id", cancelRequest);

export default router;
