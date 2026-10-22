import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import SiteVisitor from "../../models/SiteVisitor";
import Watchlist from "../../models/Watchlist";
import User from "../../models/User";
import Lead from "../../models/Lead";
import AuditLog from "../../models/AuditLog";
import RentalApplication from "../../models/RentalApplication";
import { lookupIpGeo } from "../../services/geoip";
import { logAudit } from "../../utils/logAudit";

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000);
}

export const visitorsMap = async (req: AuthRequest, res: Response) => {
  try {
    const sinceMin = Math.min(
      60 * 24 * 30,
      Math.max(1, parseInt(String(req.query.sinceMinutes || "60"), 10) || 60),
    );
    const liveOnly = String(req.query.live || "") === "1";
    const since = liveOnly ? minutesAgo(5) : minutesAgo(sinceMin);

    const filter: any = {
      lastSeenAt: { $gte: since },
      lat: { $ne: null, $exists: true },
      lng: { $ne: null, $exists: true },
      blocked: { $ne: true },
    };

    if (req.query.bbox) {
      // west,south,east,north
      const parts = String(req.query.bbox)
        .split(",")
        .map((n) => parseFloat(n));
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        const [west, south, east, north] = parts;
        filter.lng = { $gte: west, $lte: east };
        filter.lat = { $gte: south, $lte: north };
      }
    }

    const visitors = await SiteVisitor.find(filter)
      .select(
        "visitorId lat lng city region country lastSeenAt lastPath paths pageViews linkedEmail linkedUser riskScore watchlisted device browser utmCampaign utmSource",
      )
      .sort({ lastSeenAt: -1 })
      .limit(800)
      .lean();

    res.json({
      count: visitors.length,
      since,
      visitors: visitors.map((v) => ({
        ...v,
        approx: true,
        accuracyRadiusKm: v.accuracyRadiusKm ?? 25,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const enrichVisitorGeo = async (req: AuthRequest, res: Response) => {
  try {
    const visitor = await SiteVisitor.findOne({ visitorId: req.params.visitorId });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    if (!visitor.ip) {
      return res.status(400).json({ message: "No IP on visitor record" });
    }
    const geo = await lookupIpGeo(visitor.ip, { country: visitor.country });
    if (geo.country) visitor.country = geo.country;
    if (geo.region) visitor.region = geo.region;
    if (geo.city) visitor.city = geo.city;
    if (typeof geo.lat === "number") visitor.lat = geo.lat;
    if (typeof geo.lng === "number") visitor.lng = geo.lng;
    if (geo.accuracyRadiusKm) visitor.accuracyRadiusKm = geo.accuracyRadiusKm;
    if (geo.isp) visitor.isp = geo.isp;
    if (typeof geo.isProxy === "boolean") visitor.isProxy = geo.isProxy;
    if (typeof geo.isVpn === "boolean") visitor.isVpn = geo.isVpn;
    await visitor.save();

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Geo enrichment",
      details: `Enriched visitor ${visitor.visitorId}`,
      resourceType: "visitor",
      resourceId: visitor.visitorId,
      metadata: { geo },
      req,
      res,
    });

    res.json(visitor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

function riskForVisitor(v: any): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;
  if (v.botScore >= 40) {
    score += Math.min(40, v.botScore);
    factors.push(`bot_score=${v.botScore}`);
  }
  if (v.isProxy || v.isVpn) {
    score += 15;
    factors.push(v.isVpn ? "vpn" : "proxy");
  }
  if ((v.paths?.length || 0) >= 30) {
    score += 10;
    factors.push("long_path_trail");
  }
  if (v.watchlisted) {
    score += 25;
    factors.push("watchlisted");
  }
  return { score: Math.min(100, score), factors };
}

export const forensics = async (req: AuthRequest, res: Response) => {
  try {
    const type = String(req.params.type || "");
    const id = String(req.params.id || "");
    if (!["user", "visitor", "lead", "rental", "ip"].includes(type)) {
      return res.status(400).json({ message: "Invalid forensics type" });
    }

    const timeline: any[] = [];
    let subject: any = null;
    let related: any = {};
    let mapPin: any = null;
    let risk = { score: 0, factors: [] as string[] };

    if (type === "visitor") {
      const visitor = await SiteVisitor.findOne({
        $or: [{ visitorId: id }, { _id: id.match(/^[a-f0-9]{24}$/i) ? id : null }],
      }).lean();
      if (!visitor) return res.status(404).json({ message: "Not found" });
      subject = visitor;
      risk = riskForVisitor(visitor);
      if (visitor.lat != null && visitor.lng != null) {
        mapPin = {
          lat: visitor.lat,
          lng: visitor.lng,
          label: visitor.city || visitor.country || "approx.",
          approx: true,
        };
      }
      for (const p of visitor.paths || []) {
        timeline.push({
          at: visitor.lastSeenAt,
          kind: "path",
          label: `Viewed ${p}`,
        });
      }
      timeline.push({
        at: visitor.firstSeenAt,
        kind: "first_seen",
        label: `First seen · ${visitor.landingPage || "/"}`,
      });
      if (visitor.linkedUser) {
        related.user = await User.findById(visitor.linkedUser)
          .select("-password")
          .lean();
      }
      if (visitor.linkedEmail) {
        related.leads = await Lead.find({ email: visitor.linkedEmail })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
      }
    } else if (type === "user") {
      const user = await User.findById(id).select("-password").lean();
      if (!user) return res.status(404).json({ message: "Not found" });
      subject = user;
      const visitors = await SiteVisitor.find({
        $or: [{ linkedUser: user._id }, { linkedEmail: user.email }],
      })
        .sort({ lastSeenAt: -1 })
        .limit(20)
        .lean();
      related.visitors = visitors;
      related.leads = await Lead.find({ email: user.email }).limit(10).lean();
      related.rentals = await RentalApplication.find({
        $or: [
          { applicant: user._id },
          { "personalInfo.email": user.email },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      const logs = await AuditLog.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(80)
        .lean();
      for (const l of logs) {
        timeline.push({
          at: l.createdAt,
          kind: "audit",
          label: `${l.action}${l.details ? ` — ${l.details}` : ""}`,
          meta: { ip: l.ipAddress, resourceType: l.resourceType },
        });
      }
      // Pre-account browsing from linked visitors
      for (const v of visitors) {
        for (const p of (v.paths || []).slice(0, 20)) {
          timeline.push({
            at: v.firstSeenAt,
            kind: "pre_account",
            label: `Pre-account: ${p}`,
            meta: { visitorId: v.visitorId },
          });
        }
        if (v.lat != null && !mapPin) {
          mapPin = {
            lat: v.lat,
            lng: v.lng,
            label: v.city || "approx.",
            approx: true,
          };
        }
      }
      if (user.riskFlags?.includes("high_risk")) {
        risk.score += 30;
        risk.factors.push("flagged_high_risk");
      }
    } else if (type === "lead") {
      const lead = await Lead.findById(id).lean();
      if (!lead) return res.status(404).json({ message: "Not found" });
      subject = lead;
      related.visitors = await SiteVisitor.find({
        linkedEmail: lead.email,
      })
        .sort({ lastSeenAt: -1 })
        .limit(10)
        .lean();
      for (const v of related.visitors) {
        for (const p of v.paths || []) {
          timeline.push({
            at: v.lastSeenAt,
            kind: "path",
            label: `Browsed ${p} before/after lead`,
            meta: { visitorId: v.visitorId },
          });
        }
      }
      timeline.push({
        at: (lead as any).createdAt,
        kind: "lead",
        label: `Lead created (${(lead as any).status})`,
      });
    } else if (type === "rental") {
      const rental = await RentalApplication.findById(id).lean();
      if (!rental) return res.status(404).json({ message: "Not found" });
      subject = rental;
      timeline.push({
        at: (rental as any).createdAt,
        kind: "rental",
        label: `Rental application ${(rental as any).status}`,
      });
    } else if (type === "ip") {
      related.visitors = await SiteVisitor.find({ ip: id })
        .sort({ lastSeenAt: -1 })
        .limit(50)
        .lean();
      related.audit = await AuditLog.find({ ipAddress: id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      subject = { ip: id, visitorCount: related.visitors.length };
      risk.score = Math.min(100, related.visitors.length * 2);
      if (related.visitors.length >= 5) risk.factors.push("multi_visitor_same_ip");
    }

    timeline.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    res.json({
      type,
      id,
      subject,
      related,
      mapPin,
      risk,
      timeline: timeline.slice(0, 200),
    });
  } catch (error) {
    console.error("forensics:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const checkWatchlistHits = async (visitor: {
  ip?: string;
  visitorId?: string;
  linkedEmail?: string;
  linkedUser?: any;
}) => {
  const or: any[] = [];
  if (visitor.ip) or.push({ kind: "ip", value: visitor.ip });
  if (visitor.visitorId) or.push({ kind: "visitorId", value: visitor.visitorId });
  if (visitor.linkedEmail) or.push({ kind: "email", value: visitor.linkedEmail });
  if (visitor.linkedUser)
    or.push({ kind: "userId", value: String(visitor.linkedUser) });
  if (!or.length) return null;

  const hits = await Watchlist.find({ active: true, $or: or });
  if (!hits.length) return null;
  const now = new Date();
  await Watchlist.updateMany(
    { _id: { $in: hits.map((h) => h._id) } },
    { $set: { lastHitAt: now }, $inc: { hitCount: 1 } },
  );
  return hits;
};
