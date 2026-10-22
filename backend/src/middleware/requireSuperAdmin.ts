import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "./auth";
import { isSuperAdmin } from "../constants/roles";

/**
 * Hard gate: only role `super_admin` (real actor, not while impersonating).
 * Use after `protect`.
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  // While impersonating, req.user is the target — block god-mode APIs
  if (req.impersonator) {
    return res.status(403).json({
      message: "Exit impersonation before using super admin controls",
      code: "IMPERSONATION_ACTIVE",
    });
  }
  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({
      message: "Super admin access required",
      code: "SUPER_ADMIN_REQUIRED",
    });
  }
  next();
};

/** Allows the impersonator (or a super) to end / inspect impersonation. */
export const requireSuperOrImpersonator = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.impersonator && isSuperAdmin(req.impersonator.role)) {
    return next();
  }
  if (req.user && isSuperAdmin(req.user.role) && !req.impersonator) {
    return next();
  }
  return res.status(403).json({
    message: "Super admin access required",
    code: "SUPER_ADMIN_REQUIRED",
  });
};

/**
 * Confirm catastrophic actions by typing a phrase and optional break-glass code.
 */
export function requireConfirmPhrase(
  phrase: string,
  opts?: { breakGlass?: boolean },
) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const confirm = String(req.body?.confirmPhrase || "").trim();
    if (confirm !== phrase) {
      return res.status(400).json({
        message: `Type ${phrase} to confirm this action`,
        code: "CONFIRM_REQUIRED",
      });
    }
    if (opts?.breakGlass) {
      const code = String(req.body?.breakGlassCode || "").trim();
      const expected = process.env.SUPER_ADMIN_BREAK_GLASS || "";
      if (!expected || code !== expected) {
        return res.status(403).json({
          message: "Invalid break-glass code",
          code: "BREAK_GLASS_REQUIRED",
        });
      }
    }
    next();
  };
}
