import User from "../models/User";
import Notification, { type NotificationType } from "../models/Notification";
import { emitToAdmins } from "../socket/io";
import { sendWebPushToUsers } from "./webPush";

export type AdminAlertInput = {
  title: string;
  message: string;
  link: string;
  sourceKey: string;
  type?: NotificationType;
  /** Short push body (defaults to message truncated). Avoid PII. */
  pushBody?: string;
};

/**
 * Critical admin channel: in-app Notification + Socket.IO live event + Web Push.
 * Admins only — do not use for client/staff broadcast.
 *
 * Phase 1 = Notification + socket (+ in-tab sound on client)
 * Phase 2 = Web Push when tab closed
 */
export async function notifyAdminsCritical(input: AdminAlertInput) {
  const {
    title,
    message,
    link,
    sourceKey,
    type = "system",
    pushBody,
  } = input;

  const admins = await User.find({ role: "admin", isActive: true })
    .select("_id")
    .lean();

  if (admins.length === 0) return;

  const results = await Promise.all(
    admins.map(async (admin) => {
      const existing = await Notification.findOne({
        user: admin._id,
        sourceKey: `${sourceKey}:${admin._id}`,
      })
        .select("_id")
        .lean();

      if (existing) return null;

      const doc = await Notification.create({
        user: admin._id,
        title,
        message,
        type,
        link,
        sourceKey: `${sourceKey}:${admin._id}`,
        read: false,
      }).catch(() => null);

      return doc ? String(admin._id) : null;
    })
  );

  const notifiedIds = results.filter(Boolean) as string[];
  if (notifiedIds.length === 0) return;

  // Single live event for all connected admins (clients refresh their own inbox)
  emitToAdmins("admin:alert", {
    critical: true,
    title,
    message,
    link,
    type,
    sourceKey,
  });

  await sendWebPushToUsers(notifiedIds, {
    title: title.slice(0, 80),
    body: (pushBody || message).slice(0, 140),
    url: link,
    tag: sourceKey.slice(0, 64),
  });
}
