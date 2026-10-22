import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import AuditLog from "../../models/AuditLog";
import { INTERNAL_ROLES } from "../../constants/roles";

export const activityStream = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(
      200,
      Math.max(1, parseInt(String(req.query.limit || "50"), 10) || 50),
    );
    const cursor = String(req.query.cursor || "");
    const filter: any = {};

    if (req.query.action) {
      filter.action = { $regex: String(req.query.action), $options: "i" };
    }
    if (req.query.resourceType) {
      filter.resourceType = String(req.query.resourceType);
    }
    if (req.query.actorId) {
      filter.user = String(req.query.actorId);
    }
    if (req.query.ip) {
      filter.ipAddress = String(req.query.ip);
    }
    if (req.query.severity === "critical") {
      filter.action = {
        $regex: /suspend|lockdown|impersonat|compromised|force.?logout|bot/i,
      };
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(String(req.query.from));
      if (req.query.to) filter.createdAt.$lte = new Date(String(req.query.to));
    }
    if (cursor) {
      filter._id = { $lt: cursor };
    }

    let logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    // Staff shadow: only internal actors
    if (String(req.query.staffOnly) === "1") {
      logs = logs.filter((l: any) =>
        INTERNAL_ROLES.includes(l.user?.role),
      );
    }

    const nextCursor =
      logs.length === limit ? String(logs[logs.length - 1]._id) : null;

    res.json({
      events: logs.map((l: any) => ({
        id: l._id,
        at: l.createdAt,
        action: l.action,
        details: l.details,
        actor: l.user
          ? {
              id: l.user._id,
              name: l.user.name,
              email: l.user.email,
              role: l.user.role,
            }
          : null,
        ip: l.ipAddress,
        userAgent: l.userAgent,
        locationLabel: l.locationLabel || null,
        city: l.city || null,
        region: l.region || null,
        country: l.country || null,
        lat: l.lat,
        lng: l.lng,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        metadata: redactMeta(l.metadata),
        correlationId: l.metadata?.correlationId || l.metadata?.requestId,
      })),
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

function redactMeta(meta: any) {
  if (!meta || typeof meta !== "object") return meta || {};
  const clone = { ...meta };
  for (const key of Object.keys(clone)) {
    if (/password|token|secret|authorization|cookie/i.test(key)) {
      clone[key] = "[redacted]";
    }
  }
  return clone;
}

export const exportActivity = async (req: AuthRequest, res: Response) => {
  try {
    const format = String(req.query.format || "json");
    const filter: any = {};
    if (req.query.from) filter.createdAt = { $gte: new Date(String(req.query.from)) };
    if (req.query.to) {
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $lte: new Date(String(req.query.to)),
      };
    }
    const logs = await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    if (format === "csv") {
      const header =
        "createdAt,action,actorEmail,actorRole,ip,resourceType,resourceId,details\n";
      const rows = logs
        .map((l: any) =>
          [
            l.createdAt?.toISOString?.() || l.createdAt,
            JSON.stringify(l.action || ""),
            JSON.stringify(l.user?.email || ""),
            JSON.stringify(l.user?.role || ""),
            JSON.stringify(l.ipAddress || ""),
            JSON.stringify(l.resourceType || ""),
            JSON.stringify(l.resourceId || ""),
            JSON.stringify(l.details || ""),
          ].join(","),
        )
        .join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="omniscience-export.csv"',
      );
      return res.send(header + rows);
    }

    res.json({ count: logs.length, logs: logs.map((l) => ({ ...l, metadata: redactMeta(l.metadata) })) });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
