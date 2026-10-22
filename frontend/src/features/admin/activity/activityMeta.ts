import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  FileText,
  Folder,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  Phone,
  Shield,
  Target,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";

export type ActivityTone = {
  icon: LucideIcon;
  bg: string;
  fg: string;
  ring: string;
};

/** Map FSWG audit actions → timeline node colors (reference-style palette). */
export function activityTone(action: string): ActivityTone {
  const a = (action || "").toLowerCase();

  if (a.includes("logged in") || a.includes("signed up") || a.includes("registered"))
    return { icon: LogIn, bg: "bg-[#FFEDD5]", fg: "text-[#EA580C]", ring: "ring-[#FED7AA]" };
  if (a.includes("logged out"))
    return { icon: LogOut, bg: "bg-[#FEE2E2]", fg: "text-[#DC2626]", ring: "ring-[#FECACA]" };
  if (a.includes("password") || a.includes("profile"))
    return { icon: Shield, bg: "bg-[#ECFDF5]", fg: "text-[#059669]", ring: "ring-[#A7F3D0]" };
  if (a.includes("lead"))
    return { icon: Target, bg: "bg-[#FFEDD5]", fg: "text-[#C2410C]", ring: "ring-[#FED7AA]" };
  if (a.includes("rental") || a.includes("application"))
    return { icon: Home, bg: "bg-[#EDE9FE]", fg: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" };
  if (a.includes("consultation") || a.includes("booked"))
    return { icon: Phone, bg: "bg-[#FCE7F3]", fg: "text-[#DB2777]", ring: "ring-[#FBCFE8]" };
  if (a.includes("message") || a.includes("email"))
    return { icon: MessageSquare, bg: "bg-[#DBEAFE]", fg: "text-[#2563EB]", ring: "ring-[#BFDBFE]" };
  if (a.includes("content") || a.includes("file") || a.includes("upload") || a.includes("document"))
    return { icon: a.includes("upload") ? Upload : FileText, bg: "bg-[#EDE9FE]", fg: "text-[#7C3AED]", ring: "ring-[#DDD6FE]" };
  if (a.includes("user") || a.includes("client") || a.includes("advisor"))
    return { icon: Users, bg: "bg-[#FFEDD5]", fg: "text-[#EA580C]", ring: "ring-[#FED7AA]" };
  if (a.includes("notification") || a.includes("system"))
    return { icon: Bell, bg: "bg-[#ECFDF5]", fg: "text-[#059669]", ring: "ring-[#A7F3D0]" };
  if (a.includes("service") || a.includes("vault") || a.includes("note"))
    return { icon: Folder, bg: "bg-[#DBEAFE]", fg: "text-[#2563EB]", ring: "ring-[#BFDBFE]" };
  if (a.includes("created") || a.includes("submitted"))
    return { icon: UserPlus, bg: "bg-[#FFEDD5]", fg: "text-[#C2410C]", ring: "ring-[#FED7AA]" };

  return { icon: Activity, bg: "bg-[#F3F4F6]", fg: "text-[#4B5563]", ring: "ring-[#E5E7EB]" };
}

export function initials(name?: string): string {
  if (!name) return "SY";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function dayOrdinal(day: number): string {
  const j = day % 10;
  const k = day % 100;
  if (k >= 11 && k <= 13) return `${day}th`;
  if (j === 1) return `${day}st`;
  if (j === 2) return `${day}nd`;
  if (j === 3) return `${day}rd`;
  return `${day}th`;
}

/** e.g. 22nd of October 2026 */
export function formatExactDate(iso: string | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${dayOrdinal(d.getDate())} of ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Exact clock time, e.g. 2:35:08 PM */
export function formatExactTime(iso: string | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** e.g. 22nd of October 2026 at 2:35:08 PM */
export function formatExactDateTime(iso: string | Date): string {
  const date = formatExactDate(iso);
  const time = formatExactTime(iso);
  if (!date) return "";
  return time ? `${date} at ${time}` : date;
}

export function formatTime(iso: string | Date): string {
  return formatExactTime(iso) || formatExactDate(iso);
}

export function formatActivityLocation(log: {
  locationLabel?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  ipAddress?: string;
  metadata?: Record<string, any>;
}): string {
  if (log.locationLabel) return log.locationLabel;
  const composed = [log.city, log.region, log.country].filter(Boolean).join(", ");
  if (composed) return composed;
  const metaLoc = log.metadata?.locationLabel || log.metadata?.location;
  if (typeof metaLoc === "string" && metaLoc.trim()) return metaLoc.trim();
  return "";
}

export function dateGroupLabel(iso: string | Date): string {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (startOfDay.getTime() === startToday.getTime()) return "Today";
  if (startOfDay.getTime() === startYesterday.getTime()) return "Yesterday";
  return formatExactDate(iso) || d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function dateGroupKey(iso: string | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Prefer exact stored details. Never invent "Visitors → Track" from a raw URL —
 * those legacy rows had no real event payload.
 */
export function humanizeDetails(details?: string, _action?: string): string {
  const raw = (details || "").trim();
  if (!raw) return "";

  // Legacy catch-all that only stored the HTTP call — not useful as "what happened"
  if (/^(GET|POST|PUT|PATCH|DELETE)\s+\/api\//i.test(raw)) {
    return "";
  }

  return raw;
}

/** Human sentence pieces for the timeline row. */
export function activitySentence(log: any): {
  actor: string;
  verb: string;
  object?: string;
} {
  const actor =
    (log.user as any)?.name ||
    (log.metadata?.system ? "System" : "Someone");
  const action = log.action || "performed an action";
  const details = humanizeDetails(log.details, action);

  // Prefer exact details only — never show resourceType / record id chips
  let object: string | undefined;
  if (details && !/^(GET|POST|PUT|PATCH|DELETE)\s+\//i.test(details)) {
    object = details.length > 90 ? `${details.slice(0, 87)}…` : details;
  }

  return { actor, verb: action, object };
}
