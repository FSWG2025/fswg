import BotBlock from "../models/BotBlock";

/**
 * Known automation / crawler UAs only — avoid bare "bot" which false-positives
 * on ordinary browsers and in-app WebViews.
 */
const BOT_UA =
  /(?:googlebot|bingbot|yandexbot|baiduspider|duckduckbot|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|redditbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|gptbot|claudebot|chatgpt-user|bytespider|ccbot|amazonbot|anthropic-ai|cohere-ai|perplexitybot|imgsuch|scrapy|python-requests|go-http-client|libwww-perl|httpclient|java\/\d|curl\/\d|wget\/\d|phantomjs|headlesschrome|puppeteer|playwright)/i;

/** Signals that justify a hard block (real automation). Soft fingerprint gaps never block alone. */
const HARD_BLOCK_SIGNALS = new Set([
  "bot_user_agent",
  "headless_browser",
  "missing_or_short_ua",
  "path_velocity_flood",
]);

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
    score += 50;
  } else if (BOT_UA.test(ua)) {
    signals.push("bot_user_agent");
    score += 80;
  }

  // Real headless automation only — do NOT treat Electron (Cursor, Slack, etc.) as a bot
  if (/HeadlessChrome|PhantomJS/i.test(ua)) {
    signals.push("headless_browser");
    score += 60;
  }

  if (!input.hasVisitorId) {
    signals.push("no_visitor_id");
    score += 8;
  }

  // Soft fingerprint gaps — scored for analytics, never enough to block alone
  if (input.path !== undefined) {
    if (!input.language) {
      signals.push("no_language");
      score += 4;
    }
    if (!input.timezone) {
      signals.push("no_timezone");
      score += 4;
    }
    if (!input.screen) {
      signals.push("no_screen");
      score += 3;
    }
  }

  // Path velocity: only extreme floods count as hard (shared NATs / SPA bursts are common)
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
    score += 40;
  } else if (hits.length >= 25) {
    signals.push("path_velocity_high");
    score += 12;
  }

  score = Math.min(100, score);

  const hasHardSignal = signals.some((s) => HARD_BLOCK_SIGNALS.has(s));
  // Block only when a hard automation signal is present AND score is high.
  // Soft gaps (language/timezone/screen/visitor id) never trigger shouldBlock alone.
  const shouldBlock =
    hasHardSignal &&
    score >= 70 &&
    (signals.includes("bot_user_agent") ||
      signals.includes("headless_browser") ||
      signals.includes("missing_or_short_ua") ||
      (signals.includes("path_velocity_flood") && !input.hasVisitorId));

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
  const block = await BotBlock.findOne({
    $or: or,
    $and: [
      {
        $or: [
          { permanent: true },
          { blockedUntil: { $gt: now } },
        ],
      },
      // Ignore legacy soft/false-positive blocks (fingerprint-only scores)
      {
        $or: [
          { permanent: true },
          { signals: { $in: [...HARD_BLOCK_SIGNALS] } },
          { score: { $gte: 85 } },
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
  const hard = input.signals.some((s) => HARD_BLOCK_SIGNALS.has(s));
  // Prefer visitorId for non-permanent blocks so shared NATs are not poisoned
  const hours = input.hours ?? (hard ? 6 : 1);
  const blockedUntil = input.permanent
    ? null
    : new Date(Date.now() + hours * 3600_000);

  const filter: any = {};
  if (input.visitorId) filter.visitorId = input.visitorId;
  else if (input.ip) filter.ip = input.ip;
  else return null;

  const setIp =
    input.permanent ||
    input.signals.includes("bot_user_agent") ||
    input.signals.includes("headless_browser") ||
    input.signals.includes("missing_or_short_ua");

  return BotBlock.findOneAndUpdate(
    filter,
    {
      $set: {
        ...(setIp ? { ip: input.ip } : {}),
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
      $setOnInsert: {
        createdAt: new Date(),
        ...(setIp ? {} : { ip: undefined }),
      },
    },
    { upsert: true, new: true },
  );
}
