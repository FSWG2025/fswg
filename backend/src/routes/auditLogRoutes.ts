import express from "express";
import {
  getAuditLogs,
  getRecentLogs,
  getAuditSummary,
  clearOldLogs,
} from "../controllers/auditLogController";
import { protect, authorize } from "../middleware/auth";
import { ADMIN_ROLES, AUDIT_ROLES } from "../constants/roles";

const router = express.Router();

router.use(protect);
router.use(authorize(AUDIT_ROLES));

router.get("/", getAuditLogs);
router.get("/recent", getRecentLogs);
router.get("/summary", getAuditSummary);
router.delete("/clear", authorize(ADMIN_ROLES), clearOldLogs);

export default router;
