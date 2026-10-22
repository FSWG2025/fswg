import express from "express";
import {
  getFunnelOverview,
  getLeadSources,
  getConsultantPerformance,
} from "../controllers/funnelController";
import { protect, authorize } from "../middleware/auth";
import { FUNNEL_ROLES } from "../constants/roles";

const router = express.Router();

router.use(protect);
router.use(authorize(FUNNEL_ROLES));

router.get("/overview", getFunnelOverview);
router.get("/sources", getLeadSources);
router.get("/consultant-performance", getConsultantPerformance);

export default router;
