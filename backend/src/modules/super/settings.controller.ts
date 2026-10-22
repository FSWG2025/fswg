import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import SystemSettings, {
  getSystemSettings,
  deriveSystemStatus,
  DEFAULT_FEATURE_FLAGS,
} from "../../models/SystemSettings";
import User from "../../models/User";
import { logAudit } from "../../utils/logAudit";

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSystemSettings();
    res.json({
      ...settings.toObject(),
      status: deriveSystemStatus(settings),
      defaultFlags: DEFAULT_FEATURE_FLAGS,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

/** Public, unauthenticated — banner + flags needed by the site shell */
export const getPublicSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await getSystemSettings();
    const flags: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(settings.featureFlags || {})) {
      flags[k] = typeof v === "boolean" ? v : Boolean(v?.enabled);
    }
    const bannerActive =
      settings.broadcastBanner &&
      (!settings.broadcastBannerUntil ||
        new Date(settings.broadcastBannerUntil) > new Date());

    res.json({
      status: deriveSystemStatus(settings),
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      maintenanceUntil: settings.maintenanceUntil,
      maintenanceEtaBlurb: settings.maintenanceEtaBlurb,
      featureFlags: flags,
      broadcastBanner: bannerActive ? settings.broadcastBanner : "",
      botBlockEnabled: settings.botBlockEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const patchSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({
        message: "Cannot change system settings while impersonating",
      });
    }

    const settings = await getSystemSettings();
    const before = settings.toObject();
    const body = req.body || {};
    const reason = String(body.reason || "").trim();
    const confirm = String(body.confirmPhrase || "").trim();

    const enablingMaintenance =
      body.maintenanceMode === true && !settings.maintenanceMode;
    const enablingLockdown = body.lockdown === true && !settings.lockdown;
    if (enablingMaintenance && confirm !== "MAINTENANCE") {
      return res.status(400).json({
        message: "Type MAINTENANCE to enable maintenance mode",
        code: "CONFIRM_REQUIRED",
      });
    }
    if (enablingLockdown && confirm !== "LOCKDOWN") {
      return res.status(400).json({
        message: "Type LOCKDOWN to enable lockdown",
        code: "CONFIRM_REQUIRED",
      });
    }

    const boolKeys = [
      "maintenanceMode",
      "lockdown",
      "readOnlyMode",
      "freezeMessaging",
      "freezeLeadIntake",
      "freezePayments",
      "ipAllowlistEnabled",
      "botBlockEnabled",
    ] as const;

    for (const key of boolKeys) {
      if (typeof body[key] === "boolean") {
        (settings as any)[key] = body[key];
      }
    }
    if (typeof body.maintenanceMessage === "string") {
      settings.maintenanceMessage = body.maintenanceMessage.slice(0, 500);
    }
    if (body.maintenanceUntil !== undefined) {
      settings.maintenanceUntil = body.maintenanceUntil
        ? new Date(body.maintenanceUntil)
        : null;
    }
    if (typeof body.maintenanceEtaBlurb === "string") {
      settings.maintenanceEtaBlurb = body.maintenanceEtaBlurb.slice(0, 200);
    }
    if (body.featureFlags && typeof body.featureFlags === "object") {
      settings.featureFlags = {
        ...settings.featureFlags,
        ...body.featureFlags,
      };
      settings.markModified("featureFlags");
    }
    if (Array.isArray(body.blockNewSessionsByRole)) {
      settings.blockNewSessionsByRole = body.blockNewSessionsByRole
        .map(String)
        .slice(0, 20);
    }
    if (Array.isArray(body.ipAllowlistStaff)) {
      settings.ipAllowlistStaff = body.ipAllowlistStaff
        .map(String)
        .slice(0, 100);
    }
    if (typeof body.broadcastBanner === "string") {
      settings.broadcastBanner = body.broadcastBanner.slice(0, 400);
    }
    if (body.broadcastBannerUntil !== undefined) {
      settings.broadcastBannerUntil = body.broadcastBannerUntil
        ? new Date(body.broadcastBannerUntil)
        : null;
    }
    if (body.statusOverride === null || body.statusOverride === "") {
      settings.statusOverride = null;
    } else if (
      ["OK", "DEGRADED", "MAINTENANCE", "LOCKDOWN"].includes(body.statusOverride)
    ) {
      settings.statusOverride = body.statusOverride;
    }

    settings.updatedBy = req.user!._id as any;
    await settings.save();

    await logAudit({
      userId: req.user!._id.toString(),
      action: "System settings updated",
      details: reason || "Super admin patched SystemSettings",
      resourceType: "system",
      resourceId: "global",
      metadata: { before, after: settings.toObject(), reason },
      req,
      res,
    });

    // Lockdown: bump sessionVersion for everyone except supers
    if (body.lockdown === true && !before.lockdown) {
      await User.updateMany(
        { role: { $ne: "super_admin" } },
        { $inc: { sessionVersion: 1 } },
      );
      await logAudit({
        userId: req.user!._id.toString(),
        action: "Lockdown force-logout",
        details: "All non-super sessions revoked",
        resourceType: "system",
        resourceId: "global",
        req,
        res,
      });
    }

    res.json({
      ...settings.toObject(),
      status: deriveSystemStatus(settings),
    });
  } catch (error) {
    console.error("patchSettings:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const health = async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await getSystemSettings();
    res.json({
      ok: true,
      status: deriveSystemStatus(settings),
      deploySha: process.env.DEPLOY_SHA || process.env.GIT_SHA || null,
      node: process.version,
      time: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ ok: false });
  }
};
