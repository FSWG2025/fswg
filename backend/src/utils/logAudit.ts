import AuditLog from "../models/AuditLog";
import User from "../models/User";
import { lookupIpGeo } from "../services/geoip";
import { clientIp, formatLocationLabel } from "./clientIp";

interface LogAuditParams {
  userId: string;
  action: string;
  details?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  req?: any;
  res?: any;
  /** Force stealth even if actor lookup fails */
  superOnly?: boolean;
}

function markAudited(res?: any) {
  if (res && res.locals) res.locals.audited = true;
}

async function resolveSuperOnly(
  userId: string,
  req?: any,
  forced?: boolean,
): Promise<boolean> {
  if (forced) return true;
  if (req?.user?.role === "super_admin" && String(req.user._id) === String(userId)) {
    return true;
  }
  if (req?.impersonator?.role === "super_admin") {
    // Impersonation start/end already logged as super; while acting as target we
    // keep the target's footprint. Don't mark target actions as superOnly.
  }
  try {
    const u = await User.findById(userId).select("role").lean();
    return u?.role === "super_admin";
  } catch {
    return false;
  }
}

async function resolveRequestLocation(req?: any) {
  const ip = clientIp(req);
  const countryHeader = req?.headers?.["cf-ipcountry"];
  const countryHint =
    typeof countryHeader === "string" && countryHeader !== "XX"
      ? countryHeader
      : undefined;

  let city: string | undefined;
  let region: string | undefined;
  let country: string | undefined;
  let lat: number | undefined;
  let lng: number | undefined;
  let locationLabel: string | undefined;

  if (ip) {
    try {
      const geo = await lookupIpGeo(ip, { country: countryHint });
      city = geo.city;
      region = geo.region;
      country = geo.country || countryHint;
      lat = geo.lat;
      lng = geo.lng;
      locationLabel = formatLocationLabel({ city, region, country }) || undefined;
    } catch {
      country = countryHint;
      locationLabel = countryHint;
    }
  }

  return {
    ipAddress: ip || "",
    userAgent: req?.headers?.["user-agent"] || "",
    city,
    region,
    country,
    lat,
    lng,
    locationLabel,
  };
}

/**
 * Create an audit log entry.
 * Super-admin actors are flagged superOnly so normal admins never see them.
 * Location is resolved from the request IP at write time.
 */
export const logAudit = async ({
  userId,
  action,
  details,
  resourceType,
  resourceId,
  metadata,
  req,
  res,
  superOnly: forcedSuperOnly,
}: LogAuditParams): Promise<void> => {
  try {
    const superOnly = await resolveSuperOnly(userId, req, forcedSuperOnly);
    const location = await resolveRequestLocation(req);

    await AuditLog.create({
      user: userId,
      action,
      details: details || "",
      ...location,
      resourceType: resourceType || undefined,
      resourceId: resourceId || "",
      metadata: {
        ...(metadata || {}),
        ...(superOnly ? { superOnly: true } : {}),
        ...(typeof location.lat === "number" && typeof location.lng === "number"
          ? { coordinates: { lat: location.lat, lng: location.lng } }
          : {}),
      },
      superOnly,
    });
    markAudited(res || req?.res);
  } catch (error) {
    console.error("❌ Failed to log audit:", (error as Error).message);
  }
};

export const logAuditFromRequest = async (
  req: any,
  action: string,
  details?: string,
  resourceType?: string,
  resourceId?: string,
): Promise<void> => {
  try {
    if (!req.user) {
      console.warn("⚠️ Cannot log audit: No user in request");
      return;
    }
    await logAudit({
      userId: req.user._id.toString(),
      action,
      details,
      resourceType,
      resourceId,
      req,
      res: req.res,
    });
  } catch (error) {
    console.error("❌ Failed to log audit from request:", (error as Error).message);
  }
};

export const logSystemAudit = async (
  action: string,
  details?: string,
  metadata?: Record<string, any>,
  req?: any,
): Promise<void> => {
  try {
    const location = req ? await resolveRequestLocation(req) : {};
    await AuditLog.create({
      user: undefined,
      action,
      details: details || "",
      ...location,
      resourceType: "system",
      metadata: { ...(metadata || {}), system: true },
      superOnly: Boolean(metadata?.superOnly),
    });
  } catch (error) {
    console.error("❌ Failed to log system audit:", (error as Error).message);
  }
};

export const getRecentLogs = async (
  limit: number = 10,
  userId?: string,
): Promise<any[]> => {
  try {
    const filter: any = { superOnly: { $ne: true } };
    if (userId) filter.user = userId;
    return await AuditLog.find(filter)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error("❌ Failed to get recent logs:", (error as Error).message);
    return [];
  }
};

export const cleanupOldLogs = async (daysOld: number = 90): Promise<number> => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    return result.deletedCount;
  } catch (error) {
    console.error("❌ Failed to clean up old logs:", (error as Error).message);
    return 0;
  }
};
