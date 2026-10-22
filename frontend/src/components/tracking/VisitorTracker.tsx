import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { api } from "@/lib/api";
import { getOrCreateVisitorId } from "@/lib/visitorId";
import { useAuth } from "@/hooks/AuthProvider";

function utmFromSearch(search: string) {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
}

/**
 * Silent site visitor beacon. Runs on every route change.
 * Does not block UI if the API is down.
 */
const VisitorTracker = () => {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const lastSent = useRef("");

  useEffect(() => {
    const path = `${pathname}${search || ""}`;
    if (lastSent.current === path) return;
    lastSent.current = path;

    const visitorId = getOrCreateVisitorId();
    const payload = {
      visitorId,
      path,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      language: typeof navigator !== "undefined" ? navigator.language : undefined,
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined,
      screen:
        typeof window !== "undefined"
          ? `${window.screen.width}x${window.screen.height}`
          : undefined,
      ...utmFromSearch(search),
      userId: user?._id || undefined,
    };

    api.post("/visitors/track", payload).catch((err) => {
      if (err?.response?.status === 403 && err?.response?.data?.code === "BOT_BLOCKED") {
        try {
          sessionStorage.setItem("fswg_bot_blocked", "1");
        } catch {
          /* ignore */
        }
        if (!window.location.pathname.startsWith("/blocked")) {
          window.location.replace("/blocked");
        }
      }
    });
  }, [pathname, search, user?._id]);

  return null;
};

export default VisitorTracker;
