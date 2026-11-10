import BotBlock from "../models/BotBlock";

/**
 * Known automation / crawler UAs only — avoid bare "bot" which false-positives
 * on ordinary browsers and in-app WebViews.
 */
const BOT_UA =
  /(?:googlebot|bingbot|yandexbot|baiduspider|duckduckbot|facebookexternalhit|facebot|twitterbot|linkedinbot|redditbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|gptbot|claudebot|chatgpt-user|bytespider|ccbot|amazonbot|anthropic-ai|cohere-ai|perplexitybot|scrapy|python-requests|go-http-client|libwww-perl|curl\/\d|wget\/\d|phantomjs|headlesschrome|puppeteer|playwright)/i;

/** Only these justify enforcing a block against a client. */
const ENFORCEABLE_SIGNALS = ["bot_user_agent", "headless_browser"] as const;

/** Path hit timestamps per IP for velocity scoring (analytics only — never blocks). */
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
    score += 25;
  } else if (BOT_UA.test(ua)) {
    signals.push("bot_user_agent");
    score += 90;
  }

  // Real headless automation only — do NOT treat Electron (Cursor, Slack, etc.) as a bot
  if (/HeadlessChrome|PhantomJS/i.test(ua)) {
    signals.push("headless_browser");
    score += 90;
  }

  if (!input.hasVisitorId) {
    signals.push("no_visitor_id");
    score += 5;
  }

  // Soft fingerprint gaps — analytics only
  if (input.path !== undefined) {
    if (!input.language) {
      signals.push("no_language");
      score += 2;
    }
    if (!input.timezone) {
      signals.push("no_timezone");
      score += 2;
    }
    if (!input.screen) {
      signals.push("no_screen");
      score += 2;
    }
  }

  // Velocity is tracked for dashboards — never used to block (shared NATs / SPA bursts)
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
  if (hits.length >= 50) {
    signals.push("path_velocity_flood");
    score += 10;
  } else if (hits.length >= 25) {
    signals.push("path_velocity_high");
    score += 5;
  }

  score = Math.min(100, score);

  // Block ONLY clear crawler / headless automation — never soft heuristics
  const shouldBlock =
    signals.includes("bot_user_agent") || signals.includes("headless_browser");

  return {
    score,
    signals,
    shouldBlock,
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
  // Enforce only permanent blocks or blocks that recorded a real crawler/headless signal.
  // Legacy soft/false-positive rows (velocity, fingerprint gaps, high score alone) are ignored.
  const block = await BotBlock.findOne({
    $or: or,
    $and: [
      {
        $or: [
          { permanent: true },
          { blockedUntil: { $gt: now } },
        ],
      },
      {
        $or: [
          { permanent: true },
          { signals: { $in: [...ENFORCEABLE_SIGNALS] } },
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
  const hours = input.hours ?? 6;
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
