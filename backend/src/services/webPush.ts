import webpush from "web-push";
import PushSubscription from "../models/PushSubscription";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject =
    process.env.VAPID_SUBJECT ||
    process.env.CLIENT_URL ||
    "mailto:hello@firststepwealth.ca";

  if (!publicKey || !privateKey) {
    console.warn(
      "[WebPush] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set — desktop push disabled"
    );
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/** Send Web Push to specific users (admins). No PII beyond title/body summary. */
export async function sendWebPushToUsers(
  userIds: string[],
  payload: PushPayload
) {
  if (!ensureConfigured() || userIds.length === 0) return;

  const subs = await PushSubscription.find({
    user: { $in: userIds },
  }).lean();

  if (subs.length === 0) return;

  const body = JSON.stringify({
    title: payload.title.slice(0, 80),
    body: payload.body.slice(0, 140),
    url: payload.url || "/admin/approvals",
    tag: payload.tag || "fswg-admin-alert",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          body,
          { TTL: 60 * 60 }
        );
      } catch (err: any) {
        const status = err?.statusCode;
        // Gone / expired subscription
        if (status === 404 || status === 410) {
          await PushSubscription.deleteOne({ _id: sub._id }).catch(() => null);
        } else {
          console.warn("[WebPush] send failed:", status || err?.message);
        }
      }
    })
  );
}
