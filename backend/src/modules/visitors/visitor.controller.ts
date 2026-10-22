import { type Request, type Response } from "express";
import SiteVisitor from "../../models/SiteVisitor";
import User from "../../models/User";
import { lookupIpGeo } from "../../services/geoip";
import {
  assessBotSignals,
  recordBotBlock,
} from "../../services/botDetection";
import { checkWatchlistHits } from "../super/visitors.controller";
import { logSystemAudit } from "../../utils/logAudit";
import { getSystemSettings } from "../../models/SystemSettings";

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.socket.remoteAddress || "";
}

function parseUa(ua = "") {
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobile|Android|iPhone/i.test(ua);
  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return {
    browser,
    os,
    device: (isTablet ? "tablet" : isMobile ? "mobile" : "desktop") as
      | "mobile"
      | "desktop"
      | "tablet"
      | "unknown",
  };
}

function sanitizePath(path?: string) {
  if (!path || typeof path !== "string") return "/";
  const cleaned = path.trim().slice(0, 300);
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}

function pushPath(paths: string[], next: string) {
  const list = Array.isArray(paths) ? [...paths] : [];
  if (list[list.length - 1] === next) return list;
  list.push(next);
  return list.slice(-40);
}

// Simple in-memory throttle: same visitor + path within 2s is ignored
const recentHits = new Map<string, number>();
function shouldThrottle(visitorId: string, path: string) {
  const key = `${visitorId}:${path}`;
  const now = Date.now();
  const prev = recentHits.get(key) || 0;
  if (now - prev < 2000) return true;
  recentHits.set(key, now);
  if (recentHits.size > 5000) {
    const cutoff = now - 60_000;
    for (const [k, t] of recentHits) {
      if (t < cutoff) recentHits.delete(k);
    }
  }
  return false;
}

// @desc    Track a public page view (cookie visitor id)
// @route   POST /api/visitors/track
// @access  Public
export const trackVisit = async (req: Request, res: Response) => {
  try {
    const {
      visitorId,
      path,
      referrer,
      language,
      timezone,
      screen,
      utmSource,
      utmMedium,
      utmCampaign,
      userId,
      linkedEmail: bodyEmail,
      linkedName: bodyName,
    } = req.body || {};

    if (!visitorId || typeof visitorId !== "string" || visitorId.length < 8) {
      return res.status(400).json({ message: "visitorId required" });
    }
    if (visitorId.length > 80) {
      return res.status(400).json({ message: "Invalid visitorId" });
    }

    const lastPath = sanitizePath(path);
    if (shouldThrottle(visitorId, lastPath)) {
      return res.status(204).end();
    }

    const ua =
      (typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : "") || "";
    const { browser, os, device } = parseUa(ua);
    const ip = clientIp(req);
    const countryHeader = req.headers["cf-ipcountry"];
    const country =
      typeof countryHeader === "string" && countryHeader !== "XX"
        ? countryHeader
        : undefined;

    const now = new Date();

    // Bot scoring on track (in addition to botGuard)
    const bot = assessBotSignals({
      userAgent: ua,
      path: lastPath,
      ip,
      language: typeof language === "string" ? language : undefined,
      timezone: typeof timezone === "string" ? timezone : undefined,
      screen: typeof screen === "string" ? screen : undefined,
      hasVisitorId: true,
    });
    const settings = await getSystemSettings();
    if (settings.botBlockEnabled !== false && bot.shouldBlock) {
      await recordBotBlock({
        ip,
        visitorId,
        userAgent: ua,
        reason: bot.signals.join(", "),
        score: bot.score,
        signals: bot.signals,
      });
      await SiteVisitor.updateOne(
        { visitorId },
        {
          $set: {
            blocked: true,
            botScore: bot.score,
            botSignals: bot.signals,
            lastSeenAt: now,
          },
        },
        { upsert: false },
      );
      return res.status(403).json({
        message: "Automated traffic is not allowed",
        code: "BOT_BLOCKED",
      });
    }

    let visitor = await SiteVisitor.findOne({ visitorId });
    if (visitor?.blocked) {
      return res.status(403).json({
        message: "Access denied",
        code: "BOT_BLOCKED",
      });
    }

    let linkedUser;
    let linkedEmail: string | undefined;
    let linkedName: string | undefined;

    // Only trust linkedUser from an authenticated session — never from body userId
    // (prevents forging another user's identity onto visitor forensics).
    const sessionUser = (req as any).user;
    if (sessionUser?._id) {
      linkedUser = sessionUser._id;
      linkedEmail = sessionUser.email;
      linkedName = sessionUser.name;
    } else if (userId && typeof userId === "string") {
      // Ignore unauthenticated userId claims entirely
      void userId;
    }

    // Soft identify from lead / book-a-call (no Gmail scrape — only what they typed)
    if (
      !linkedEmail &&
      typeof bodyEmail === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bodyEmail.trim())
    ) {
      linkedEmail = bodyEmail.trim().toLowerCase().slice(0, 120);
    }
    if (!linkedName && typeof bodyName === "string" && bodyName.trim()) {
      linkedName = bodyName.trim().slice(0, 120);
    }

    // Geo enrich on create or when coords missing (async-safe, non-blocking delay)
    let geo: Awaited<ReturnType<typeof lookupIpGeo>> | null = null;
    const needsGeo = !visitor || visitor.lat == null || visitor.lng == null;
    if (needsGeo && ip) {
      try {
        geo = await lookupIpGeo(ip, { country });
      } catch {
        geo = null;
      }
    }

    if (!visitor) {
      visitor = await SiteVisitor.create({
        visitorId,
        ip,
        userAgent: ua.slice(0, 500),
        browser,
        os,
        device,
        language: typeof language === "string" ? language.slice(0, 32) : undefined,
        timezone: typeof timezone === "string" ? timezone.slice(0, 64) : undefined,
        screen: typeof screen === "string" ? screen.slice(0, 32) : undefined,
        referrer:
          typeof referrer === "string" ? referrer.slice(0, 500) : undefined,
        landingPage: lastPath,
        lastPath,
        paths: [lastPath],
        utmSource:
          typeof utmSource === "string" ? utmSource.slice(0, 120) : undefined,
        utmMedium:
          typeof utmMedium === "string" ? utmMedium.slice(0, 120) : undefined,
        utmCampaign:
          typeof utmCampaign === "string" ? utmCampaign.slice(0, 120) : undefined,
        country: geo?.country || country,
        city: geo?.city,
        region: geo?.region,
        lat: geo?.lat,
        lng: geo?.lng,
        accuracyRadiusKm: geo?.accuracyRadiusKm,
        isp: geo?.isp,
        isProxy: geo?.isProxy,
        isVpn: geo?.isVpn,
        botScore: bot.score,
        botSignals: bot.signals,
        visitCount: 1,
        pageViews: 1,
        firstSeenAt: now,
        lastSeenAt: now,
        linkedUser,
        linkedEmail,
        linkedName,
      });
    } else {
      const hoursSince =
        (now.getTime() - new Date(visitor.lastSeenAt).getTime()) / 36e5;
      if (hoursSince >= 0.5) visitor.visitCount += 1;

      visitor.pageViews += 1;
      visitor.lastSeenAt = now;
      visitor.lastPath = lastPath;
      visitor.paths = pushPath(visitor.paths || [], lastPath);
      visitor.ip = ip || visitor.ip;
      visitor.userAgent = ua.slice(0, 500) || visitor.userAgent;
      visitor.browser = browser;
      visitor.os = os;
      visitor.device = device;
      if (typeof language === "string" && language) visitor.language = language.slice(0, 32);
      if (typeof timezone === "string" && timezone) visitor.timezone = timezone.slice(0, 64);
      if (typeof screen === "string" && screen) visitor.screen = screen.slice(0, 32);
      if (typeof referrer === "string" && referrer && !visitor.referrer) {
        visitor.referrer = referrer.slice(0, 500);
      }
      if (typeof utmSource === "string" && utmSource && !visitor.utmSource) {
        visitor.utmSource = utmSource.slice(0, 120);
      }
      if (typeof utmMedium === "string" && utmMedium && !visitor.utmMedium) {
        visitor.utmMedium = utmMedium.slice(0, 120);
      }
      if (typeof utmCampaign === "string" && utmCampaign && !visitor.utmCampaign) {
        visitor.utmCampaign = utmCampaign.slice(0, 120);
      }
      if (country) visitor.country = country;
      if (geo) {
        if (geo.country) visitor.country = geo.country;
        if (geo.city) visitor.city = geo.city;
        if (geo.region) visitor.region = geo.region;
        if (typeof geo.lat === "number") visitor.lat = geo.lat;
        if (typeof geo.lng === "number") visitor.lng = geo.lng;
        if (geo.accuracyRadiusKm) visitor.accuracyRadiusKm = geo.accuracyRadiusKm;
        if (geo.isp) visitor.isp = geo.isp;
        if (typeof geo.isProxy === "boolean") visitor.isProxy = geo.isProxy;
        if (typeof geo.isVpn === "boolean") visitor.isVpn = geo.isVpn;
      }
      visitor.botScore = Math.max(visitor.botScore || 0, bot.score);
      visitor.botSignals = bot.signals.length
        ? bot.signals
        : visitor.botSignals;
      if (linkedUser) visitor.linkedUser = linkedUser as any;
      if (linkedEmail) visitor.linkedEmail = linkedEmail;
      if (linkedName) visitor.linkedName = linkedName;
      await visitor.save();
    }

    // Watchlist return alerts
    try {
      const hits = await checkWatchlistHits({
        ip,
        visitorId,
        linkedEmail: visitor.linkedEmail,
        linkedUser: visitor.linkedUser,
      });
      if (hits?.length) {
        visitor.watchlisted = true;
        await visitor.save();
        await logSystemAudit(
          "Watchlist hit",
          `Visitor ${visitorId} matched ${hits.length} watch entries`,
          {
            visitorId,
            ip,
            watchIds: hits.map((h) => h._id),
          },
        );
      }
    } catch (e) {
      console.warn("[visitors/watchlist]", (e as Error).message);
    }

    return res.status(204).end();
  } catch (error) {
    console.error("[visitors/track]", error);
    // Never break the public site if tracking fails
    return res.status(204).end();
  }
};

// @desc    List site visitors for admin
// @route   GET /api/visitors
// @access  Private (admin)
export const listVisitors = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit || "40"), 10) || 40)
    );
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { linkedEmail: { $regex: q, $options: "i" } },
        { linkedName: { $regex: q, $options: "i" } },
        { ip: { $regex: q, $options: "i" } },
        { visitorId: { $regex: q, $options: "i" } },
        { lastPath: { $regex: q, $options: "i" } },
        { referrer: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
      ];
    }

    const [visitorsRaw, total] = await Promise.all([
      SiteVisitor.find(filter)
        .sort({ lastSeenAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("linkedUser", "name email role")
        .lean(),
      SiteVisitor.countDocuments(filter),
    ]);

    // Normal admins get redacted precision; super_admin sees full IP + coords.
    // Also hide visitors linked to super_admin accounts (stealth).
    const isSuper = (req as any).user?.role === "super_admin";
    const visitors = isSuper
      ? visitorsRaw
      : visitorsRaw
          .filter((v: any) => v.linkedUser?.role !== "super_admin")
          .map((v: any) => ({
            ...v,
            linkedUser:
              v.linkedUser?.role === "super_admin"
                ? undefined
                : v.linkedUser
                  ? {
                      _id: v.linkedUser._id,
                      name: v.linkedUser.name,
                      email: v.linkedUser.email,
                      // never leak super_admin via role field
                      role:
                        v.linkedUser.role === "super_admin"
                          ? "admin"
                          : v.linkedUser.role,
                    }
                  : v.linkedUser,
            ip: v.ip
              ? String(v.ip)
                  .replace(/(\.\d+){1}$/, ".x")
                  .replace(/:[0-9a-f]+$/i, ":x")
              : v.ip,
            lat: undefined,
            lng: undefined,
            accuracyRadiusKm: undefined,
          }));

    res.json({
      visitors,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error("[visitors/list]", error);
    res.status(500).json({ message: "Could not load visitors" });
  }
};

// @desc    Visitor summary stats
// @route   GET /api/visitors/stats
// @access  Private (admin)
export const visitorStats = async (_req: Request, res: Response) => {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, today, week, identified, pageViewsAgg] = await Promise.all([
      SiteVisitor.countDocuments(),
      SiteVisitor.countDocuments({ lastSeenAt: { $gte: dayAgo } }),
      SiteVisitor.countDocuments({ lastSeenAt: { $gte: weekAgo } }),
      SiteVisitor.countDocuments({
        $or: [
          { linkedUser: { $ne: null } },
          { linkedEmail: { $exists: true, $nin: [null, ""] } },
        ],
      }),
      SiteVisitor.aggregate([
        { $group: { _id: null, views: { $sum: "$pageViews" } } },
      ]),
    ]);

    res.json({
      total,
      activeToday: today,
      activeWeek: week,
      identified,
      pageViews: pageViewsAgg[0]?.views || 0,
    });
  } catch (error) {
    console.error("[visitors/stats]", error);
    res.status(500).json({ message: "Could not load visitor stats" });
  }
};
