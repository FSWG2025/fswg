import express from "express";
import {
  submitApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  requestInformation,
} from "../controllers/rentalApplicationController";
import { protect, authorize } from "../middleware/auth";
import {
  RENTAL_DELETE_ROLES,
  RENTAL_STAFF_ROLES,
} from "../constants/roles";

const router = express.Router();

router.use(protect);

router.post("/", submitApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);

router.patch("/:id", authorize(RENTAL_STAFF_ROLES), updateApplicationStatus);
router.patch(
  "/:id/request-info",
  authorize(RENTAL_STAFF_ROLES),
  requestInformation
);
router.delete("/:id", authorize(RENTAL_DELETE_ROLES), deleteApplication);

export default router;
