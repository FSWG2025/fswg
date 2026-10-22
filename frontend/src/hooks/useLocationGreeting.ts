import { useEffect, useState } from "react";
import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";

export type GreetingPart = { icon: LucideIcon; text: string; timeZone: string };

const TZ_CACHE_KEY = "fswg:greeting-tz";

function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Hour 0–23 in a specific IANA timezone */
export function hourInTimeZone(timeZone: string, date = new Date()): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).formatToParts(date);
    const raw = parts.find((p) => p.type === "hour")?.value ?? "0";
    let hour = Number(raw);
    if (hour === 24 || Number.isNaN(hour)) hour = 0;
    return Math.min(23, Math.max(0, hour));
  } catch {
    return date.getHours();
  }
}

export function greetingFromHour(hour: number): Omit<GreetingPart, "timeZone"> {
  // Location-accurate dayparts (local civil time)
  if (hour >= 5 && hour < 12) return { icon: Sunrise, text: "morning" };
  if (hour >= 12 && hour < 17) return { icon: Sun, text: "afternoon" };
  if (hour >= 17 && hour < 21) return { icon: Sunset, text: "evening" };
  return { icon: Moon, text: "night" };
}

function readCachedTz(): string | null {
  try {
    const raw = localStorage.getItem(TZ_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tz?: string; at?: number };
    // Cache for 24h: IP/location timezone rarely changes mid-day
    if (parsed.tz && parsed.at && Date.now() - parsed.at < 24 * 60 * 60 * 1000) {
      return parsed.tz;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCachedTz(tz: string) {
  try {
    localStorage.setItem(TZ_CACHE_KEY, JSON.stringify({ tz, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/**
 * Resolve timezone from the user's network location (IP).
 * Falls back silently if the lookup fails.
 */
async function resolveLocationTimeZone(): Promise<string | null> {
  const controllers: AbortController[] = [];
  const withTimeout = (ms: number) => {
    const c = new AbortController();
    controllers.push(c);
    window.setTimeout(() => c.abort(), ms);
    return c.signal;
  };

  try {
    // Primary: ipapi (timezone from IP location)
    const r1 = await fetch("https://ipapi.co/timezone/", {
      signal: withTimeout(4000),
    });
    if (r1.ok) {
      const tz = (await r1.text()).trim();
      if (tz && tz.includes("/") && !tz.toLowerCase().includes("error")) {
        return tz;
      }
    }
  } catch {
    /* try next */
  }

  try {
    // Fallback: worldtimeapi by IP
    const r2 = await fetch("https://worldtimeapi.org/api/ip", {
      signal: withTimeout(4000),
    });
    if (r2.ok) {
      const data = await r2.json();
      if (typeof data?.timezone === "string" && data.timezone.includes("/")) {
        return data.timezone;
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

function buildGreeting(timeZone: string): GreetingPart {
  const hour = hourInTimeZone(timeZone);
  return { ...greetingFromHour(hour), timeZone };
}

/**
 * Greeting that tracks the user's location timezone (IP) with device TZ fallback,
 * and refreshes as the clock crosses dayparts.
 */
export function useLocationGreeting(): GreetingPart {
  const initialTz = readCachedTz() || deviceTimeZone();
  const [greeting, setGreeting] = useState<GreetingPart>(() =>
    buildGreeting(initialTz)
  );

  useEffect(() => {
    let cancelled = false;
    let tickId = 0;

    const applyTz = (tz: string) => {
      if (cancelled) return;
      setGreeting(buildGreeting(tz));
    };

    const startTicker = (tz: string) => {
      window.clearInterval(tickId);
      tickId = window.setInterval(() => applyTz(tz), 30_000);
    };

    startTicker(initialTz);

    (async () => {
      const located = await resolveLocationTimeZone();
      if (cancelled) return;
      const tz = located || deviceTimeZone();
      if (located) writeCachedTz(located);
      applyTz(tz);
      startTicker(tz);
    })();

    // Recompute when tab becomes visible (laptop wake / travel)
    const onVisible = () => {
      const tz = readCachedTz() || deviceTimeZone();
      applyTz(tz);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(tickId);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // initialTz is stable enough for mount; we re-resolve inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return greeting;
}
