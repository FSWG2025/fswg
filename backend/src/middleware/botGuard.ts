import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "./auth";
import {
  assessBotSignals,
  isCurrentlyBlocked,
  recordBotBlock,
} from "../services/botDetection";
import { getSystemSettings } from "../models/SystemSettings";
import { isSuperAdmin } from "../constants/roles";
import { logSystemAudit } from "../utils/logAudit";

function clientIp(req: AuthRequest): string {
  // Prefer Express-resolved req.ip (trust proxy). Do not take raw client XFF.
  return String(req.ip || req.socket.remoteAddress || "").replace(/^::ffff:/, "");
}

/**
 * Blocks known bots / flooders from mutating public APIs.
 * Skips super_admin authenticated traffic.
 */
export const botGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (isSuperAdmin(req.user?.role)) return next();

    const settings = await getSystemSettings();
    if (settings.botBlockEnabled === false) return next();

    const ip = clientIp(req);
    const visitorId =
      (typeof req.body?.visitorId === "string" && req.body.visitorId) ||
      (typeof req.cookies?.fswg_vid === "string" && req.cookies.fswg_vid) ||
      undefined;
    const ua =
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : "";

    if (await isCurrentlyBlocked({ ip, visitorId })) {
      return res.status(403).json({
        message: "Access denied",
        code: "BOT_BLOCKED",
      });
    }

    // Only score aggressively on public/high-volume endpoints
    const url = req.originalUrl.split("?")[0];
    const watchPaths =
      url.startsWith("/api/visitors") ||
      url.startsWith("/api/leads") ||
      url === "/api/users/register" ||
      url === "/api/users/login" ||
      url.startsWith("/api/users/forgot-password");

    if (!watchPaths) return next();

    const assessment = assessBotSignals({
      userAgent: ua,
      path: url,
      ip,
      language: req.body?.language,
      timezone: req.body?.timezone,
      screen: req.body?.screen,
      hasVisitorId: Boolean(visitorId),
    });

    // Attach for controllers
    (req as any).botAssessment = assessment;

    if (assessment.shouldBlock) {
      await recordBotBlock({
        ip,
        visitorId,
        userAgent: ua,
        reason: assessment.signals.join(", ") || "bot_score_threshold",
        score: assessment.score,
        signals: assessment.signals,
        hours: 24,
      });
      await logSystemAudit("Bot blocked", `IP ${ip} score=${assessment.score}`, {
        signals: assessment.signals,
        ip,
        visitorId,
      });
      return res.status(403).json({
        message: "Automated traffic is not allowed",
        code: "BOT_BLOCKED",
      });
    }

    next();
  } catch (err) {
    console.error("[botGuard]", err);
    next();
  }
};
