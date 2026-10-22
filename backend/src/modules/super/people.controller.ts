import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import User from "../../models/User";
import { logAudit } from "../../utils/logAudit";
import {
  isUserRole,
  isSuperAdmin,
  USER_ROLES,
} from "../../constants/roles";
import { invalidateSuperAdminIdCache } from "../../utils/superStealth";

function actorId(req: AuthRequest) {
  return (req.impersonator || req.user)!._id.toString();
}

function isSelfTarget(req: AuthRequest, targetId: string) {
  return String(req.user?._id) === String(targetId);
}

export const listPeople = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit || "25"), 10) || 25),
    );
    const role = String(req.query.role || "");
    const search = String(req.query.search || "").trim();
    const flag = String(req.query.flag || "");
    const filter: any = {};

    if (role && role !== "all") filter.role = role;
    if (flag) filter.riskFlags = flag;
    if (req.query.suspended === "true") filter.isActive = false;
    if (req.query.suspended === "false") filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password -resetPasswordToken")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Cannot suspend while impersonating" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isSelfTarget(req, user._id.toString())) {
      return res.status(400).json({ message: "Cannot suspend yourself" });
    }

    const reason = String(req.body?.reason || "").trim();
    user.isActive = false;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Suspended user",
      details: `Suspended ${user.email}${reason ? `: ${reason}` : ""}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      metadata: { reason, targetRole: user.role },
      req,
      res,
    });

    res.json({ message: "User suspended", user: { _id: user._id, isActive: false } });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const restoreUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Cannot restore while impersonating" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = true;
    user.softDeletedAt = null;
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Restored user",
      details: `Restored ${user.email}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ message: "User restored", user: { _id: user._id, isActive: true } });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const forceLogoutUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Cannot force logout while impersonating" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isSelfTarget(req, user._id.toString())) {
      return res.status(400).json({
        message: "Cannot force-logout yourself from People Control",
      });
    }

    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Force logout",
      details: `Revoked all sessions for ${user.email}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ message: "Sessions revoked", sessionVersion: user.sessionVersion });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const softDeleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Cannot delete while impersonating" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (isSelfTarget(req, user._id.toString())) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    if (user.riskFlags?.includes("legal_hold")) {
      return res.status(403).json({
        message: "User is on legal hold and cannot be deleted",
        code: "LEGAL_HOLD",
      });
    }
    if (isSuperAdmin(user.role)) {
      return res.status(403).json({ message: "Cannot soft-delete a super admin" });
    }

    user.softDeletedAt = new Date();
    user.isActive = false;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Soft deleted user",
      details: `Soft-deleted ${user.email}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ message: "User soft-deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const changeRole = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Cannot change roles while impersonating" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isSelfTarget(req, user._id.toString())) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const nextRole = String(req.body?.role || "");
    if (!isUserRole(nextRole)) {
      return res.status(400).json({
        message: `Invalid role. Allowed: ${USER_ROLES.join(", ")}`,
      });
    }

    // Only super can create/promote to super_admin
    if (nextRole === "super_admin" || user.role === "super_admin") {
      const breakGlass = String(req.body?.breakGlassCode || "").trim();
      const expected = process.env.SUPER_ADMIN_BREAK_GLASS || "";
      if (!expected || breakGlass !== expected) {
        return res.status(403).json({
          message: "Break-glass code required to create or demote super_admin",
          code: "BREAK_GLASS_REQUIRED",
        });
      }
      if (String(req.body?.confirmPhrase || "").trim() !== "SUPER_ADMIN") {
        return res.status(400).json({
          message: "Type SUPER_ADMIN to confirm",
          code: "CONFIRM_REQUIRED",
        });
      }
    }

    if (user.role === "super_admin" && nextRole !== "super_admin") {
      const n = await User.countDocuments({
        role: "super_admin",
        isActive: true,
      });
      if (n <= 1) {
        return res.status(400).json({
          message: "Cannot demote the last active super admin",
        });
      }
    }

    const prev = user.role;
    user.role = nextRole;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    if (prev === "super_admin" || nextRole === "super_admin") {
      invalidateSuperAdminIdCache();
    }

    await logAudit({
      userId: actorId(req),
      action: "Changed user role",
      details: `${user.email}: ${prev} → ${nextRole}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      metadata: { before: prev, after: nextRole },
      req,
      res,
    });

    res.json({ message: "Role updated", role: nextRole });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const setRiskFlags = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const flags = Array.isArray(req.body?.riskFlags) ? req.body.riskFlags : [];
    const allowed = new Set(["high_risk", "vip", "legal_hold"]);
    user.riskFlags = flags.filter((f: string) => allowed.has(f));
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Updated risk flags",
      details: `${user.email} flags=${user.riskFlags.join(",")}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      metadata: { riskFlags: user.riskFlags },
      req,
      res,
    });

    res.json({ riskFlags: user.riskFlags });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const addInternalNote = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const note = String(req.body?.note || "").trim().slice(0, 1000);
    if (!note) return res.status(400).json({ message: "Note required" });
    const stamped = `[${new Date().toISOString()}] ${req.user!.email}: ${note}`;
    user.internalNotes = [...(user.internalNotes || []), stamped].slice(-50);
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Added internal note",
      details: `Internal note on ${user.email}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ internalNotes: user.internalNotes });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const compromisedPlaybook = async (req: AuthRequest, res: Response) => {
  try {
    if (req.impersonator) {
      return res.status(403).json({ message: "Not allowed while impersonating" });
    }
    const user = await User.findById(req.params.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (isSelfTarget(req, user._id.toString())) {
      return res.status(400).json({
        message: "Cannot run the compromised playbook on yourself",
      });
    }
    if (isSuperAdmin(user.role)) {
      return res.status(403).json({ message: "Use break-glass flow for super accounts" });
    }

    user.isActive = false;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (!user.riskFlags.includes("legal_hold")) {
      user.riskFlags.push("legal_hold");
    }
    if (!user.riskFlags.includes("high_risk")) {
      user.riskFlags.push("high_risk");
    }
    await user.save();

    await logAudit({
      userId: actorId(req),
      action: "Compromised account playbook",
      details: `Suspended + revoked + legal hold on ${user.email}`,
      resourceType: "user",
      resourceId: user._id.toString(),
      metadata: { playbook: true },
      req,
      res,
    });

    res.json({
      message: "Playbook applied: suspended, sessions revoked, legal hold set",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
