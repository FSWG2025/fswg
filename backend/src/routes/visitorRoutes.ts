import express from "express";
import {
  trackVisit,
  listVisitors,
  visitorStats,
} from "../controllers/visitorController";
import { protect, authorize } from "../middleware/auth";
import { ADMIN_ROLES } from "../constants/roles";

const router = express.Router();

// Public beacon — must stay unauthenticated
router.post("/track", trackVisit);

router.use(protect);
router.use(authorize(ADMIN_ROLES));

router.get("/stats", visitorStats);
router.get("/", listVisitors);

export default router;
