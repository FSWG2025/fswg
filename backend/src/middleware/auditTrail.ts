import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth";
import { logAudit, logSystemAudit } from "../utils/logAudit";

/** High-frequency / noise — never write these to Activity Log */
const SKIP_PREFIXES = [
  "/api/uploadthing",
  "/api/inngest",
  "/api/search",
  "/api/audit-logs",
  "/api/visitors/track",
  "/api/visitors",
  "/api/notifications",
  "/api/dashboard",
];

const SENSITIVE_KEYS = new Set([
  "password",
  "currentpassword",
  "newpassword",
  "confirmpassword",
  "token",
  "resettoken",
  "secret",
  "jwt",
  "authorization",
  "otp",
]);

function str(v: unknown, max = 160): string | null {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (typeof v === "string") return v.trim().slice(0, max) || null;
  return null;
}

function personLabel(obj: Record<string, unknown> | null | undefined): string | null {
  if (!obj) return null;
  const name =
    str(obj.name) ||
    [str(obj.firstName), str(obj.lastName)].filter(Boolean).join(" ") ||
    null;
  const email = str(obj.email);
  if (name && email) return `${name} <${email}>`;
  return name || email;
}

function entityFromResponse(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  // Common wrapper shapes
  for (const key of [
    "lead",
    "user",
    "consultation",
    "application",
    "content",
    "service",
    "message",
    "note",
    "data",
  ]) {
    if (b[key] && typeof b[key] === "object") {
      return b[key] as Record<string, unknown>;
    }
  }
  return b;
}

/**
 * Exact, factual detail line: what fields were submitted / what the API returned.
 * Never returns a raw HTTP path.
 */
function buildExactDetails(
  method: string,
  path: string,
  reqBody: unknown,
  resBody: unknown,
): { action: string; details: string; resourceType?: string; resourceId?: string } | null {
  const lower = path.toLowerCase();
  const entity = entityFromResponse(resBody);
  const body =
    reqBody && typeof reqBody === "object" && !Array.isArray(reqBody)
      ? (reqBody as Record<string, unknown>)
      : {};

  const who =
    personLabel(entity) ||
    personLabel(body) ||
    str(body.linkedEmail) ||
    str(body.linkedName);

  const changes: string[] = [];

  for (const [key, val] of Object.entries(body)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) continue;
    if (val === undefined || val === null || val === "") continue;
    // Skip huge blobs
    if (typeof val === "string" && val.length > 300) {
      changes.push(`updated ${key} (${val.length} chars)`);
      continue;
    }
    if (typeof val === "object") {
      if (Array.isArray(val)) {
        changes.push(`${key}: ${val.length} item(s)`);
      }
      continue;
    }
    changes.push(`set ${key} to "${str(val, 100)}"`);
  }

  let action = "Updated record";
  let resourceType: string | undefined;
  let resourceId =
    str(entity?._id) ||
    str(entity?.id) ||
    path.match(/\/([0-9a-fA-F]{24})(?:\/|$)/)?.[1] ||
    undefined;

  if (lower.includes("/users/login")) {
    action = "Logged In";
    return {
      action,
      details: who ? `Signed in as ${who}` : "Signed in",
      resourceType: "auth",
      resourceId,
    };
  }
  if (lower.includes("/users/logout")) {
    return {
      action: "Logged Out",
      details: who ? `Signed out (${who})` : "Signed out",
      resourceType: "auth",
    };
  }
  if (lower.includes("/users/register")) {
    const role = str(body.role) || str(entity?.role) || "client";
    return {
      action: "Signed Up",
      details: who
        ? `New account ${who}, role ${role}`
        : `New account created, role ${role}`,
      resourceType: "user",
      resourceId,
    };
  }
  if (lower.includes("/leads")) {
    resourceType = "lead";
    if (method === "POST") {
      action = "Submitted Lead";
      const interest = str(body.interest) || str(entity?.interest);
      const source = str(body.source) || str(entity?.source);
      const bits = [
        who ? `Lead ${who}` : "New lead",
        interest ? `interest: ${interest}` : null,
        source ? `source: ${source}` : null,
        str(body.phone) ? `phone: ${str(body.phone)}` : null,
      ].filter(Boolean);
      return { action, details: bits.join(" · "), resourceType, resourceId };
    }
    if (method === "DELETE") {
      return {
        action: "Deleted Lead",
        details: who ? `Deleted lead ${who}` : "Deleted a lead",
        resourceType,
        resourceId,
      };
    }
    action = "Updated Lead";
    const status = str(body.status);
    const bits = [
      who ? `Lead ${who}` : "Lead updated",
      status ? `status set to ${status}` : null,
      ...changes.filter((c) => !c.startsWith("set status")),
    ].filter(Boolean);
    return {
      action,
      details: bits.join(" · ") || changes.join(" · ") || "Lead fields updated",
      resourceType,
      resourceId,
    };
  }

  if (lower.includes("/consultations")) {
    resourceType = "consultation";
    const when = str(body.dateTime) || str(entity?.dateTime);
    const service = str(body.serviceType) || str(entity?.serviceType);
    if (method === "POST") {
      return {
        action: "Booked Consultation",
        details: [
          who ? `Client ${who}` : "Consultation booked",
          when ? `at ${when}` : null,
          service ? `service: ${service}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        resourceType,
        resourceId,
      };
    }
    return {
      action: method === "DELETE" ? "Cancelled Consultation" : "Updated Consultation",
      details:
        [
          who ? `Consultation for ${who}` : null,
          str(body.status) ? `status set to ${str(body.status)}` : null,
          ...changes.slice(0, 5),
        ]
          .filter(Boolean)
          .join(" · ") || "Consultation changed",
      resourceType,
      resourceId,
    };
  }

  if (lower.includes("/rental-applications")) {
    resourceType = "rental_application";
    if (method === "POST") {
      return {
        action: "Submitted Rental Application",
        details: [
          who ? `Applicant ${who}` : "Rental application submitted",
          str(body.propertyAddress) || str(entity?.propertyAddress)
            ? `property: ${str(body.propertyAddress) || str(entity?.propertyAddress)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
        resourceType,
        resourceId,
      };
    }
    return {
      action: "Updated Rental Application",
      details:
        [
          who ? `Application for ${who}` : null,
          str(body.status) ? `status set to ${str(body.status)}` : null,
          ...changes.slice(0, 6),
        ]
          .filter(Boolean)
          .join(" · ") || "Rental application changed",
      resourceType,
      resourceId,
    };
  }

  if (lower.includes("/messages") && method === "POST") {
    const preview = str(body.body) || str(body.message);
    return {
      action: "Sent Message",
      details: preview
        ? `Message: "${preview.slice(0, 140)}${preview.length > 140 ? "…" : ""}"`
        : "Sent a message",
      resourceType: "message",
      resourceId,
    };
  }

  if (lower.includes("/content")) {
    resourceType = "content";
    const title = str(body.title) || str(entity?.title) || str(body.slug);
    if (method === "POST") {
      return {
        action: "Created Content",
        details: title ? `Published/created "${title}"` : "Created content",
        resourceType,
        resourceId,
      };
    }
    if (method === "DELETE") {
      return {
        action: "Deleted Content",
        details: title ? `Deleted "${title}"` : "Deleted content",
        resourceType,
        resourceId,
      };
    }
    return {
      action: "Updated Content",
      details:
        [
          title ? `Content "${title}"` : null,
          str(body.status) ? `status set to ${str(body.status)}` : null,
          ...changes.filter((c) => !c.includes("title") && !c.includes("status")).slice(0, 4),
        ]
          .filter(Boolean)
          .join(" · ") || "Content updated",
      resourceType,
      resourceId,
    };
  }

  if (lower.includes("/upload") && method === "POST") {
    const file =
      str(body.fileName) ||
      str(entity?.fileName) ||
      str(entity?.name) ||
      str(body.originalname);
    return {
      action: "Uploaded File",
      details: file ? `Uploaded file "${file}"` : "Uploaded a file",
      resourceType: "vault",
      resourceId,
    };
  }

  if (lower.includes("/users/") && (method === "PUT" || method === "PATCH")) {
    resourceType = "user";
    return {
      action: "Updated User",
      details:
        [
          who ? `User ${who}` : "User updated",
          str(body.role) ? `role set to ${str(body.role)}` : null,
          body.isActive !== undefined ? `isActive set to ${String(body.isActive)}` : null,
          ...changes
            .filter((c) => !c.includes("role") && !c.includes("isActive"))
            .slice(0, 5),
        ]
          .filter(Boolean)
          .join(" · ") || "User fields updated",
      resourceType,
      resourceId,
    };
  }

  if (lower.includes("/services")) {
    resourceType = "service";
    const title = str(body.title) || str(entity?.title);
    action =
      method === "POST"
        ? "Created Service"
        : method === "DELETE"
          ? "Deleted Service"
          : "Updated Service";
    return {
      action,
      details:
        [
          title ? `Service "${title}"` : null,
          ...changes.slice(0, 5),
        ]
          .filter(Boolean)
          .join(" · ") || `${action}`,
      resourceType,
      resourceId,
    };
  }

  // Generic fallback — still exact fields, never the URL
  if (changes.length === 0 && !who) {
    // Nothing concrete to report (empty body delete with no entity) — skip noise
    if (method === "DELETE" && resourceId) {
      return {
        action: "Deleted record",
        details: `Deleted record ending …${String(resourceId).slice(-6)}`,
        resourceId,
      };
    }
    return null;
  }

  const resource = path
    .replace(/^\/api\/?/, "")
    .split("/")
    .filter((s) => s && !/^[0-9a-fA-F]{24}$/.test(s))[0];

  action =
    method === "POST"
      ? `Created ${resource || "record"}`
      : method === "DELETE"
        ? `Deleted ${resource || "record"}`
        : `Updated ${resource || "record"}`;

  return {
    action: action.replace(/-/g, " "),
    details: [who ? `For ${who}` : null, ...changes.slice(0, 8)]
      .filter(Boolean)
      .join(" · "),
    resourceType: resource?.replace(/-/g, "_"),
    resourceId,
  };
}

/**
 * Catch-all mutation audit with exact field-level details.
 * Skips if a controller already called logAudit (res.locals.audited).
 */
export const auditTrail = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return next();
  }

  const originalPath = req.originalUrl.split("?")[0];
  if (SKIP_PREFIXES.some((p) => originalPath.startsWith(p))) {
    return next();
  }

  // Capture JSON response so we can name the actual record that was written
  let responseBody: unknown;
  const originalJson = res.json.bind(res);
  (res as any).json = (body: unknown) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (res.statusCode >= 400) return;
    if (res.locals.audited) return;

    const described = buildExactDetails(
      method,
      originalPath,
      req.body,
      responseBody,
    );
    if (!described || !described.details) return;

    void (async () => {
      try {
        if (req.user?._id) {
          await logAudit({
            userId: String(req.user._id),
            action: described.action,
            details: described.details,
            resourceType: described.resourceType,
            resourceId: described.resourceId,
            metadata: { exact: true },
            req,
            res,
          });
        } else {
          await logSystemAudit(
            described.action,
            described.details,
            {
              exact: true,
              resourceType: described.resourceType,
              resourceId: described.resourceId,
            },
            req,
          );
        }
      } catch {
        /* never block response */
      }
    })();
  });

  next();
};
