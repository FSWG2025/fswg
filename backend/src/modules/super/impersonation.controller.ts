import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import User from "../../models/User";
import ImpersonationGrant from "../../models/ImpersonationGrant";
import { generateToken } from "../../utils/generateToken";
import { logAudit } from "../../utils/logAudit";
import { isSuperAdmin } from "../../constants/roles";

const IMPERSONATION_MINUTES = 30;

export const startImpersonation = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(400).json({ message: "Already impersonating" });
    }
    if (!isSuperAdmin(req.user?.role)) {
      return res.status(403).json({ message: "Super admin required" });
    }

    const reason = String(req.body?.reason || "").trim();
    if (reason.length < 5) {
      return res.status(400).json({ message: "Reason required (min 5 chars)" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (String(target._id) === String(req.user!._id)) {
      return res.status(400).json({ message: "Cannot impersonate yourself" });
    }
    if (!target.isActive || target.softDeletedAt) {
      return res.status(400).json({ message: "Cannot impersonate inactive user" });
    }
    if (isSuperAdmin(target.role)) {
      return res.status(403).json({
        message: "Cannot impersonate another super admin",
      });
    }

    // End any prior active grants for this super
    await ImpersonationGrant.updateMany(
      { superId: req.user!._id, active: true },
      { $set: { active: false, endedAt: new Date() } },
    );

    const expiresAt = new Date(Date.now() + IMPERSONATION_MINUTES * 60_000);
    const grant = await ImpersonationGrant.create({
      superId: req.user!._id,
      targetId: target._id,
      reason,
      expiresAt,
      active: true,
    });

    const token = generateToken(target._id.toString(), res, {
      sessionVersion: target.sessionVersion || 0,
      impersonatorId: req.user!._id.toString(),
      grantId: grant._id.toString(),
    });

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Started impersonation",
      details: `Impersonating ${target.email} — ${reason}`,
      resourceType: "impersonation",
      resourceId: grant._id.toString(),
      metadata: {
        impersonatorId: req.user!._id.toString(),
        actingAsId: target._id.toString(),
        reason,
        expiresAt,
      },
      req,
      res,
    });

    res.json({
      message: "Impersonation started",
      token,
      // Full acting-as user so the SPA lands in their real dashboard shell
      user: {
        _id: target._id,
        name: target.name,
        email: target.email,
        role: target.role,
        phone: target.phone,
        address: target.address,
        clientType: target.clientType,
        isActive: target.isActive,
        expertise: target.expertise,
        assignedConsultant: target.assignedConsultant,
      },
      grant: {
        id: grant._id,
        expiresAt,
        reason,
        target: {
          _id: target._id,
          name: target.name,
          email: target.email,
          role: target.role,
          phone: target.phone,
          address: target.address,
          clientType: target.clientType,
          isActive: target.isActive,
        },
        impersonator: {
          _id: req.user!._id,
          name: req.user!.name,
          email: req.user!.email,
          role: req.user!.role,
        },
      },
    });
  } catch (error) {
    console.error("startImpersonation:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const endImpersonation = async (req: AuthRequest, res: Response) => {
  try {
    const impersonator = req.impersonator;
    const grantId = req.impersonationGrantId;

    if (!impersonator || !grantId) {
      return res.status(400).json({ message: "Not currently impersonating" });
    }

    await ImpersonationGrant.findByIdAndUpdate(grantId, {
      active: false,
      endedAt: new Date(),
    });

    const token = generateToken(impersonator._id.toString(), res, {
      sessionVersion: impersonator.sessionVersion || 0,
    });

    await logAudit({
      userId: impersonator._id.toString(),
      action: "Ended impersonation",
      details: `Exited impersonation of ${req.user?.email}`,
      resourceType: "impersonation",
      resourceId: grantId,
      metadata: {
        impersonatorId: impersonator._id.toString(),
        actingAsId: req.user?._id?.toString(),
      },
      req,
      res,
    });

    res.json({
      message: "Impersonation ended",
      token,
      user: {
        _id: impersonator._id,
        name: impersonator.name,
        email: impersonator.email,
        role: impersonator.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const getImpersonationStatus = async (req: AuthRequest, res: Response) => {
  if (!req.impersonator || !req.impersonationGrantId) {
    return res.json({ active: false });
  }
  const grant = await ImpersonationGrant.findById(req.impersonationGrantId).lean();
  res.json({
    active: true,
    grantId: req.impersonationGrantId,
    expiresAt: grant?.expiresAt,
    reason: grant?.reason,
    target: {
      _id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
    impersonator: {
      _id: req.impersonator._id,
      name: req.impersonator.name,
      email: req.impersonator.email,
      role: req.impersonator.role,
    },
  });
};
