import express from "express";
import { getDashboardStats } from "../modules/dashboard/dashboard.controller";
import { protect } from "../middleware/auth";

const router = express.Router();

// Dashboard stats available for all authenticated users
router.get("/stats", protect, getDashboardStats);

export default router;