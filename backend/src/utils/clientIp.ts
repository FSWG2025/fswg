import type { Request } from "express";

/** Best-effort public client IP (respects proxies / Cloudflare). */
export function clientIp(req: Request | undefined | null): string {
  if (!req) return "";
  const cf = req.headers?.["cf-connecting-ip"];
  if (typeof cf === "string" && cf.trim()) return cf.trim();

  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(",")[0].trim();
  }

  const realIp = req.headers?.["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();

  const raw = req.ip || (req as any).socket?.remoteAddress || "";
  return String(raw).replace(/^::ffff:/, "");
}

export function formatLocationLabel(parts: {
  city?: string;
  region?: string;
  country?: string;
}): string {
  return [parts.city, parts.region, parts.country].filter(Boolean).join(", ");
}
