import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "./auth";
import { getSystemSettings } from "../models/SystemSettings";
import { isSuperAdmin, isPlatformAdmin, INTERNAL_ROLES } from "../constants/roles";

const ALLOWLIST_PREFIXES = [
  "/api/health",
  "/api/users/login",
  "/api/users/logout",
  "/api/users/profile",
  "/api/super",
  "/api/system/public",
  "/api/visitors/track",
];

function pathAllowed(path: string): boolean {
  return ALLOWLIST_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/") || path.startsWith(p),
  );
}

/**
 * Blocks non-super traffic during maintenance / lockdown / read-only writes.
 * Mount early on /api after optionalAuth is not available — uses cookie parse via optional later.
 * For maintenance we check JWT lightly via req.user if protect already ran;
 * for public routes, attach via optionalAuth before this or skip user check.
 */
export const maintenanceGate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Always allow health + public system status
    if (
      req.path === "/health" ||
      req.originalUrl.startsWith("/api/health") ||
      req.originalUrl.startsWith("/api/system/public")
    ) {
      return next();
    }

    const settings = await getSystemSettings();
    const method = req.method.toUpperCase();
    const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);
    const user = req.user;
    const superUser = isSuperAdmin(user?.role);

    if (settings.lockdown && !superUser) {
      // Super-only during lockdown except login (so supers can get in)
      const url = req.originalUrl.split("?")[0];
      if (
        url === "/api/users/login" ||
        url.startsWith("/api/system/public") ||
        url === "/api/health"
      ) {
        return next();
      }
      return res.status(503).json({
        message: "Platform lockdown is active. Only super admins may operate.",
        code: "LOCKDOWN",
        status: "LOCKDOWN",
      });
    }

    if (settings.maintenanceMode && !superUser) {
      const url = req.originalUrl.split("?")[0];
      if (pathAllowed(url) || url === "/api/users/login") {
        return next();
      }
      return res.status(503).json({
        message:
          settings.maintenanceMessage ||
          "Platform is under maintenance. Please try again later.",
        code: "MAINTENANCE",
        status: "MAINTENANCE",
        until: settings.maintenanceUntil,
        eta: settings.maintenanceEtaBlurb,
      });
    }

    if (settings.readOnlyMode && isMutating && !superUser) {
      const url = req.originalUrl.split("?")[0];
      if (
        url.startsWith("/api/users/login") ||
        url.startsWith("/api/users/logout") ||
        url.startsWith("/api/visitors/track")
      ) {
        return next();
      }
      return res.status(503).json({
        message: "Platform is in read-only mode.",
        code: "READ_ONLY",
        status: "DEGRADED",
      });
    }

    if (
      settings.freezeLeadIntake &&
      isMutating &&
      req.originalUrl.startsWith("/api/leads") &&
      !isPlatformAdmin(user?.role)
    ) {
      return res.status(503).json({
        message: "Lead intake is temporarily frozen.",
        code: "FREEZE_LEADS",
      });
    }

    if (
      settings.freezeMessaging &&
      isMutating &&
      req.originalUrl.startsWith("/api/messages") &&
      !isPlatformAdmin(user?.role)
    ) {
      return res.status(503).json({
        message: "Messaging is temporarily frozen.",
        code: "FREEZE_MESSAGING",
      });
    }

    // Staff IP allowlist
    if (
      settings.ipAllowlistEnabled &&
      settings.ipAllowlistStaff?.length &&
      user &&
      INTERNAL_ROLES.includes(user.role as any) &&
      !superUser
    ) {
      // Use Express req.ip (respects trust proxy). Do not trust raw XFF from clients.
      const cleaned = String(req.ip || req.socket.remoteAddress || "").replace(
        /^::ffff:/,
        "",
      );
      if (!settings.ipAllowlistStaff.includes(cleaned)) {
        return res.status(403).json({
          message: "Staff access restricted by IP allowlist",
          code: "IP_ALLOWLIST",
        });
      }
    }

    next();
  } catch (err) {
    console.error("[maintenanceGate]", err);
    // Fail closed: do not bypass lockdown / maintenance when settings cannot load
    const path = (req.originalUrl || req.path || "").split("?")[0];
    if (path === "/api/health" || path.endsWith("/health")) {
      return next();
    }
    return res.status(503).json({
      message: "Service temporarily unavailable. Please try again shortly.",
      code: "GATE_UNAVAILABLE",
    });
  }
};

/**
 * Feature-flag gate for registration etc.
 */
export async function isFeatureEnabled(
  flag: string,
  role?: string,
): Promise<boolean> {
  const settings = await getSystemSettings();
  const raw = settings.featureFlags?.[flag];
  if (raw === undefined || raw === null) return true;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "object") {
    if (!raw.enabled) return false;
    if (raw.roles?.length && role) {
      return raw.roles.includes(role);
    }
    return raw.enabled;
  }
  return true;
}
