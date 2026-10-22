import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";

/**
 * Mitigate cookie-based CSRF: mutating requests that rely on the jwt cookie
 * must also send a non-simple header that browsers won't attach on cross-site
 * form posts. SPA axios always sets X-Requested-With.
 *
 * Bearer-only requests are exempt (attacker cannot force a victim's Bearer header).
 */
export function csrfGuard(req: AuthRequest, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return next();
  }

  // UploadThing uses its own signed protocol; vault auth is enforced in its middleware
  if (req.path.startsWith("/uploadthing") || req.originalUrl.includes("/uploadthing")) {
    return next();
  }

  const hasCookie = Boolean(req.cookies?.jwt);
  if (!hasCookie) return next();

  const hasBearer =
    typeof req.headers.authorization === "string" &&
    req.headers.authorization.startsWith("Bearer ");
  if (hasBearer) return next();

  const xrw = String(req.headers["x-requested-with"] || "");
  if (xrw.toLowerCase() === "xmlhttprequest") return next();

  return res.status(403).json({
    message: "CSRF validation failed",
    code: "CSRF_REJECTED",
  });
}
