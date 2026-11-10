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
 * Failures must never redirect or lock the UI — tracking is best-effort only.
 */
const VisitorTracker = () => {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const lastSent = useRef("");

  useEffect(() => {
    // Never beacon from the blocked page (avoids retry loops)
    if (pathname.startsWith("/blocked")) return;

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

    api.post("/visitors/track", payload).catch(() => {
      // Telemetry only — never imprison the user on /blocked
    });
  }, [pathname, search, user?._id]);

  return null;
};

export default VisitorTracker;
