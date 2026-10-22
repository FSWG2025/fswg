import express from "express";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  getPushVapidPublicKey,
  getPushStatus,
  subscribePush,
  unsubscribePush,
} from "../controllers/notificationController";
import { authorize, protect } from "../middleware/auth";

const router = express.Router();

// Web Push — register before /:id routes (admins only)
router.get(
  "/push/vapid-public-key",
  protect,
  authorize(["admin"]),
  getPushVapidPublicKey
);
router.get("/push/status", protect, authorize(["admin"]), getPushStatus);
router.post("/push/subscribe", protect, authorize(["admin"]), subscribePush);
router.delete("/push/subscribe", protect, authorize(["admin"]), unsubscribePush);

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);
router.patch("/:id/read", protect, markNotificationRead);

export default router;
