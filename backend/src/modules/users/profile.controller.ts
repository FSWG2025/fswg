import { type Request, type Response } from "express";
import crypto from "crypto";
import User from "../../models/User";
import { generateToken } from "../../utils/generateToken";
import { logAudit } from "../../utils/logAudit";
import type { AuthRequest } from "../../middleware/auth";
import { USER_ROLES, isUserRole } from "../../constants/roles";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      res.json({
        user: req.user,
        impersonation: req.impersonator
          ? {
              active: true,
              grantId: req.impersonationGrantId,
              impersonator: {
                _id: req.impersonator._id,
                name: req.impersonator.name,
                email: req.impersonator.email,
                role: req.impersonator.role,
              },
              actingAs: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
              },
            }
          : { active: false },
      });
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
};

// @desc    Update own profile (name, phone, address)
// @route   PATCH /api/users/profile
// @access  Private

export const updateOwnProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof req.body.name === "string" && req.body.name.trim().length >= 2) {
      user.name = req.body.name.trim();
    }
    if (typeof req.body.phone === "string") {
      user.phone = req.body.phone.trim();
    }
    if (typeof req.body.address === "string") {
      user.address = req.body.address.trim();
    }

    const updated = await user.save();
    await logAudit({
      userId: updated._id.toString(),
      action: "Updated Profile",
      details: `Profile updated for ${updated.email}`,
      resourceType: "user",
      resourceId: updated._id.toString(),
      req,
      res,
    });
    res.json({
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        address: updated.address,
        clientType: updated.clientType,
        assignedConsultant: updated.assignedConsultant,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("Update own profile error:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
};

// @desc    Get all users (admin/consultant)
// @route   GET /api/users
// @access  Private (admin, consultant)
