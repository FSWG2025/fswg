import type { Response } from "express";
import Notification from '../../models/Notification';
import Consultation from '../../models/Consultation';
import RentalApplication from '../../models/RentalApplication';
import PushSubscription from '../../models/PushSubscription';
import type { AuthRequest } from '../../middleware/auth';
import { getVapidPublicKey } from '../../services/webPush';

const upsertNotification = async (payload: {
  user: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  sourceKey: string;
}) => {
  await Notification.findOneAndUpdate(
    { user: payload.user, sourceKey: payload.sourceKey },
    {
      $setOnInsert: {
        user: payload.user,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        link: payload.link,
        sourceKey: payload.sourceKey,
        read: false,
      },
    },
    { upsert: true, new: true }
  );
};

/** Generate contextual FSWG notifications for the current user (idempotent). */
const syncSmartNotifications = async (userId: string, role: string) => {
  if (role !== "client") return;

  await upsertNotification({
    user: userId,
    sourceKey: "welcome:fswg",
    type: "system",
    title: "Welcome to First Step Wealth Group",
    message:
      "Your hub for rental support, insurance guidance, wealth planning, and advisor consultations is ready.",
    link: "/dashboard",
  });

  await upsertNotification({
    user: userId,
    sourceKey: "tip:book-consultation",
    type: "consultation",
    title: "Book a free discovery call",
    message:
      "Talk with an advisor about rentals, insurance, or building wealth in Canada. Scheduling takes a few minutes.",
    link: "/bookings",
  });

  await upsertNotification({
    user: userId,
    sourceKey: "tip:insurance",
    type: "insurance",
    title: "Explore insurance pathways",
    message:
      "Life, health, and protection options can support your family. Review guidance or book a call when you are ready.",
    link: "/insurance",
  });

  await upsertNotification({
    user: userId,
    sourceKey: "tip:wealth",
    type: "wealth",
    title: "Try the wealth calculator",
    message:
      "See how consistent savings can grow over time with First Step’s wealth projection tools.",
    link: "/wealth",
  });

  await upsertNotification({
    user: userId,
    sourceKey: "tip:network",
    type: "network",
    title: "Interested in the advisor network?",
    message:
      "If you want to help families as an advisor, learn how to join the First Step network.",
    link: "/join-network",
  });

  await upsertNotification({
    user: userId,
    sourceKey: "tip:learning",
    type: "learning",
    title: "Newcomer-friendly learning",
    message:
      "Browse practical articles on settling in Canada, rentals, and financial first steps.",
    link: "/blog",
  });

  const upcoming = await Consultation.find({
    client: userId,
    dateTime: { $gte: new Date() },
    status: "scheduled",
  })
    .sort({ dateTime: 1 })
    .limit(5)
    .populate("service", "title")
    .lean();

  const in48h = Date.now() + 48 * 60 * 60 * 1000;
  for (const c of upcoming) {
    const when = new Date(c.dateTime as Date);
    const serviceTitle = (c as any).service?.title || "Consultation";
    await upsertNotification({
      user: userId,
      sourceKey: `consultation:${c._id}:scheduled`,
      type: "consultation",
      title: `Upcoming: ${serviceTitle}`,
      message: `Your consultation is scheduled for ${when.toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
      })}. Review your prep checklist on the dashboard.`,
      link: "/bookings",
    });

    if (when.getTime() <= in48h) {
      await upsertNotification({
        user: userId,
        sourceKey: `consultation:${c._id}:soon`,
        type: "consultation",
        title: "Consultation within 48 hours",
        message: `${serviceTitle} is coming up soon. Have your questions and documents ready.`,
        link: "/bookings",
      });
    }
  }

  const apps = await RentalApplication.find({ applicant: userId })
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  if (apps.length === 0) {
    await upsertNotification({
      user: userId,
      sourceKey: "rental:start",
      type: "rental",
      title: "Start a rental guarantee application",
      message:
        "Need help securing a rental? Begin your rental support application when you are ready.",
      link: "/rental-applications/new",
    });
  }

  for (const app of apps) {
    const status = String(app.status || "pending");
    await upsertNotification({
      user: userId,
      sourceKey: `rental:${app._id}:${status}`,
      type: "rental",
      title: `Rental application: ${status.replace(/_/g, " ")}`,
      message:
        status === "approved"
          ? "Great news. Your rental application was approved. Check details in My Applications."
          : status === "rejected"
            ? "Your rental application needs attention. Open My Applications for next steps."
            : "Your rental application is being reviewed. We will notify you of important updates.",
      link: "/rental-applications",
    });
  }
};

// @desc    List notifications for current user (syncs smart alerts first)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    await syncSmartNotifications(String(user._id), user.role);

    const limit = Math.min(Number(req.query.limit) || 40, 100);
    const notifications = await Notification.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load notifications" });
  }
};

// @desc    Mark one notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user!._id,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update notification" });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user!._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update notifications" });
  }
};

// @desc    Public VAPID key for Web Push subscribe (admins use this)
// @route   GET /api/notifications/push/vapid-public-key
// @access  Private (admin)
export const getPushVapidPublicKey = async (_req: AuthRequest, res: Response) => {
  const key = getVapidPublicKey();
  if (!key) {
    return res.status(503).json({
      message:
        "Web Push is not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY on the server.",
    });
  }
  res.json({ publicKey: key });
};

// @desc    Push subscription status for current admin
// @route   GET /api/notifications/push/status
// @access  Private (admin)
export const getPushStatus = async (req: AuthRequest, res: Response) => {
  try {
    const count = await PushSubscription.countDocuments({ user: req.user!._id });
    res.json({
      configured: Boolean(getVapidPublicKey()),
      subscribed: count > 0,
      subscriptionCount: count,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load push status" });
  }
};

// @desc    Save Web Push subscription (admin critical alerts)
// @route   POST /api/notifications/push/subscribe
// @access  Private (admin)
export const subscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({
        message: "Invalid subscription: endpoint, keys.p256dh, and keys.auth required",
      });
    }

    const sub = await PushSubscription.findOneAndUpdate(
      { endpoint: String(endpoint) },
      {
        $set: {
          user: req.user!._id,
          endpoint: String(endpoint),
          keys: {
            p256dh: String(keys.p256dh),
            auth: String(keys.auth),
          },
          userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Desktop alerts enabled",
      endpoint: sub.endpoint,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to save subscription" });
  }
};

// @desc    Remove Web Push subscription(s)
// @route   DELETE /api/notifications/push/subscribe
// @access  Private (admin)
export const unsubscribePush = async (req: AuthRequest, res: Response) => {
  try {
    const endpoint = req.body?.endpoint ? String(req.body.endpoint) : null;
    if (endpoint) {
      await PushSubscription.deleteOne({ user: req.user!._id, endpoint });
    } else {
      await PushSubscription.deleteMany({ user: req.user!._id });
    }
    res.json({ message: "Desktop alerts disabled" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to remove subscription" });
  }
};
