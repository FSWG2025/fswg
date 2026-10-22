import User from "../models/User";
import { isSuperAdmin } from "../constants/roles";

let cachedSuperIds: { ids: string[]; at: number } | null = null;
const CACHE_MS = 60_000;

/** ObjectIds of all super_admin accounts (cached briefly). */
export async function getSuperAdminIds(): Promise<string[]> {
  const now = Date.now();
  if (cachedSuperIds && now - cachedSuperIds.at < CACHE_MS) {
    return cachedSuperIds.ids;
  }
  const supers = await User.find({ role: "super_admin" }).select("_id").lean();
  const ids = supers.map((u) => String(u._id));
  cachedSuperIds = { ids, at: now };
  return ids;
}

export function invalidateSuperAdminIdCache() {
  cachedSuperIds = null;
}

export function viewerIsSuper(req: { user?: { role?: string } } | null | undefined) {
  return isSuperAdmin(req?.user?.role);
}

/** Hide legacy noise rows that only stored an HTTP path (e.g. POST /api/visitors/track). */
export const AUDIT_NOISE_FILTER = {
  details: { $not: /^(GET|POST|PUT|PATCH|DELETE)\s+\/api\//i },
};

/**
 * Mongo filter that hides super-admin actors from non-supers.
 * Uses superOnly on new logs + excludes known super user ids (legacy).
 */
export async function auditVisibilityFilter(req: {
  user?: { role?: string };
}): Promise<Record<string, unknown>> {
  const noise = { ...AUDIT_NOISE_FILTER };
  if (viewerIsSuper(req)) return noise;
  const superIds = await getSuperAdminIds();
  const and: any[] = [
    noise,
    { superOnly: { $ne: true } },
    { "metadata.superOnly": { $ne: true } },
  ];
  if (superIds.length) {
    and.push({
      $or: [
        { user: { $exists: false } },
        { user: null },
        { user: { $nin: superIds } },
      ],
    });
  }
  return { $and: and };
}

/**
 * Mutates/returns a user list filter so non-supers never see super_admin rows.
 */
export function applyUserStealthFilter(
  req: { user?: { role?: string } },
  filter: Record<string, any>,
): Record<string, any> {
  if (viewerIsSuper(req)) return filter;

  const next = { ...filter };

  if (next.role === "super_admin") {
    // Impossible match: admin asked for supers
    return { _id: { $exists: false } };
  }

  if (typeof next.role === "string") {
    // Specific staff/client role: already not super_admin
    return next;
  }

  if (next.role && typeof next.role === "object" && Array.isArray(next.role.$in)) {
    next.role = {
      ...next.role,
      $in: next.role.$in.filter((r: string) => r !== "super_admin"),
    };
    return next;
  }

  next.role = { $ne: "super_admin" };
  return next;
}

export function assertVisibleUser(
  req: { user?: { role?: string } },
  targetRole: string | undefined,
): boolean {
  if (viewerIsSuper(req)) return true;
  return targetRole !== "super_admin";
}
