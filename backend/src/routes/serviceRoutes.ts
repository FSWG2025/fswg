import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategory,
} from "../controllers/serviceController";
import { protect, authorize, optionalAuth } from "../middleware/auth";
import { SERVICE_ROLES } from "../constants/roles";

const router = express.Router();

router.get("/", optionalAuth, getAllServices);
router.get("/category/:category", getServicesByCategory);
router.get("/:id", getServiceById);

router.post("/", protect, authorize(SERVICE_ROLES), createService);
router.patch("/:id", protect, authorize(SERVICE_ROLES), updateService);
router.delete("/:id", protect, authorize(SERVICE_ROLES), deleteService);

export default router;
