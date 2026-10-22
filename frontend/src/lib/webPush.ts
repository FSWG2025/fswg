import { api } from "@/lib/api";

const SW_PATH = "/sw-push.js";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}

export async function fetchPushStatus() {
  const { data } = await api.get("/notifications/push/status");
  return data as {
    configured: boolean;
    subscribed: boolean;
    subscriptionCount: number;
  };
}

export async function enableDesktopAlerts(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!pushSupported()) {
    return { ok: false, message: "This browser does not support desktop alerts." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      message:
        permission === "denied"
          ? "Permission denied. Re-enable notifications for this site in your browser settings, then try again."
          : "Permission was not granted.",
    };
  }

  const { data: keyData } = await api.get("/notifications/push/vapid-public-key");
  const publicKey = keyData?.publicKey as string | undefined;
  if (!publicKey) {
    return { ok: false, message: "Server is missing VAPID keys." };
  }

  const reg = await ensureServiceWorker();
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = sub.toJSON();
  await api.post("/notifications/push/subscribe", {
    endpoint: json.endpoint,
    keys: json.keys,
  });

  return { ok: true, message: "Desktop alerts enabled." };
}

export async function disableDesktopAlerts(): Promise<void> {
  if (!pushSupported()) return;

  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await api.delete("/notifications/push/subscribe", {
        data: { endpoint: sub.endpoint },
      });
      await sub.unsubscribe();
    } else {
      await api.delete("/notifications/push/subscribe");
    }
  } catch {
    await api.delete("/notifications/push/subscribe").catch(() => null);
  }
}
