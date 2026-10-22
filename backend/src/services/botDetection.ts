import BotBlock from "../models/BotBlock";

const BOT_UA =
  /bot|crawler|spider|crawl|slurp|scrapy|curl\/|wget|python-requests|httpclient|java\/|go-http|libwww|headless|phantom|selenium|puppeteer|playwright|chatgpt|gptbot|claudebot|bytespider|semrush|ahrefs|mj12bot|dotbot|petalbot|yandexbot|bingpreview|facebookexternalhit|twitterbot|linkedinbot|discordbot|whatsapp|telegrambot/i;

/** Path hit timestamps per IP for velocity scoring */
const pathVelocity = new Map<string, number[]>();

export interface BotAssessment {
  score: number;
  signals: string[];
  shouldBlock: boolean;
}

export function assessBotSignals(input: {
  userAgent?: string;
  path?: string;
  ip?: string;
  language?: string;
  timezone?: string;
  screen?: string;
  hasVisitorId?: boolean;
}): BotAssessment {
  const signals: string[] = [];
  let score = 0;
  const ua = input.userAgent || "";

  if (!ua || ua.length < 12) {
    signals.push("missing_or_short_ua");
    score += 40;
  } else if (BOT_UA.test(ua)) {
    signals.push("bot_user_agent");
    score += 70;
  }

  if (/HeadlessChrome|PhantomJS|Electron/i.test(ua)) {
    signals.push("headless_browser");
    score += 50;
  }

  if (!input.hasVisitorId) {
    signals.push("no_visitor_id");
    score += 15;
  }

  // Missing typical browser fingerprint fields on track calls
  if (input.path !== undefined) {
    if (!input.language) {
      signals.push("no_language");
      score += 10;
    }
    if (!input.timezone) {
      signals.push("no_timezone");
      score += 10;
    }
    if (!input.screen) {
      signals.push("no_screen");
      score += 8;
    }
  }

  // Path velocity: > 30 hits / 10s from same IP
  const ip = input.ip || "unknown";
  const now = Date.now();
  const windowMs = 10_000;
  const hits = (pathVelocity.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  pathVelocity.set(ip, hits);
  if (pathVelocity.size > 8000) {
    const keys = [...pathVelocity.keys()].slice(0, 1000);
    for (const k of keys) pathVelocity.delete(k);
  }
  if (hits.length >= 30) {
    signals.push("path_velocity_flood");
    score += 55;
  } else if (hits.length >= 15) {
    signals.push("path_velocity_high");
    score += 25;
  }

  score = Math.min(100, score);
  return {
    score,
    signals,
    shouldBlock: score >= 70,
  };
}

export async function isCurrentlyBlocked(opts: {
  ip?: string;
  visitorId?: string;
}): Promise<boolean> {
  const or: any[] = [];
  if (opts.ip) or.push({ ip: opts.ip });
  if (opts.visitorId) or.push({ visitorId: opts.visitorId });
  if (!or.length) return false;

  const now = new Date();
  const block = await BotBlock.findOne({
    $or: or,
    $and: [
      {
        $or: [
          { permanent: true },
          { blockedUntil: { $gt: now } },
          { blockedUntil: null, permanent: false, score: { $gte: 70 } },
        ],
      },
    ],
  }).lean();

  return Boolean(block);
}

export async function recordBotBlock(input: {
  ip?: string;
  visitorId?: string;
  userAgent?: string;
  reason: string;
  score: number;
  signals: string[];
  hours?: number;
  permanent?: boolean;
}) {
  const hours = input.hours ?? 24;
  const blockedUntil = input.permanent
    ? null
    : new Date(Date.now() + hours * 3600_000);

  const filter: any = {};
  if (input.visitorId) filter.visitorId = input.visitorId;
  else if (input.ip) filter.ip = input.ip;
  else return null;

  return BotBlock.findOneAndUpdate(
    filter,
    {
      $set: {
        ip: input.ip,
        visitorId: input.visitorId,
        userAgent: (input.userAgent || "").slice(0, 500),
        reason: input.reason,
        score: input.score,
        signals: input.signals,
        blockedUntil,
        permanent: Boolean(input.permanent),
        lastSeenAt: new Date(),
      },
      $inc: { hitCount: 1 },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true, new: true },
  );
}
