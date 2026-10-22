import { type Request, type Response } from "express";
import crypto from "crypto";
import User from "../../models/User";
import { generateToken } from "../../utils/generateToken";
import { logAudit } from "../../utils/logAudit";
import type { AuthRequest } from "../../middleware/auth";
import {
  USER_ROLES,
  isUserRole,
  isPlatformAdmin,
  isSuperAdmin,
} from "../../constants/roles";
import {
  applyUserStealthFilter,
  assertVisibleUser,
  invalidateSuperAdminIdCache,
} from "../../utils/superStealth";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;
    const clientType = req.query.clientType as string;

    let filter: any = {};

    if (role && role !== "all") filter.role = role;
    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;
    if (clientType) filter.clientType = clientType;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Hide super_admin accounts from normal admins / staff
    filter = applyUserStealthFilter(req as any, filter);

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .populate("assignedConsultant", "name email expertise")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      users,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin, consultant)

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("assignedConsultant", "name email expertise");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!assertVisibleUser(req as any, user.role)) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin, consultant)

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!assertVisibleUser(req as any, user.role)) {
      return res.status(404).json({ message: "User not found" });
    }

    const actor = (req as any).user;
    const actorIsAdmin = isPlatformAdmin(actor?.role);
    const targetIsProtectedAdmin =
      user.role === "admin" || user.role === "super_admin";

    // Non-admins may only touch client accounts (never admin/staff identity)
    if (!actorIsAdmin && user.role !== "client") {
      return res.status(403).json({
        message: "Only admins can update staff accounts",
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) {
      if (!actorIsAdmin) {
        return res.status(403).json({
          message: "Only admins can change account emails",
        });
      }
      if (targetIsProtectedAdmin && !isSuperAdmin(actor?.role)) {
        return res.status(403).json({
          message: "Only a super admin can change an admin's email",
        });
      }
      const existingEmail = await User.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = req.body.email.toLowerCase();
    }

    // Only admins may set passwords for other accounts
    if (req.body.password) {
      if (!actorIsAdmin) {
        return res.status(403).json({
          message: "Only admins can reset another user's password",
        });
      }
      user.password = req.body.password;
      user.sessionVersion = (user.sessionVersion || 0) + 1;
    }

    // Never allow changing your own role (super must stay super)
    if (
      req.body.role &&
      String(user._id) === String(actor?._id) &&
      req.body.role !== user.role
    ) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    // Never allow suspending/deactivating yourself via this endpoint
    if (
      req.body.isActive === false &&
      String(user._id) === String(actor?._id)
    ) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    // Only admins may change roles (prevents privilege escalation via CRM staff)
    if (req.body.role) {
      if (!actorIsAdmin) {
        return res.status(403).json({
          message: "Only admins can change user roles",
        });
      }
      if (!isUserRole(req.body.role)) {
        return res.status(400).json({
          message: `Invalid role. Allowed: ${USER_ROLES.join(", ")}`,
        });
      }
      if (
        (req.body.role === "super_admin" || user.role === "super_admin") &&
        !isSuperAdmin(actor?.role)
      ) {
        return res.status(403).json({
          message: "Only a super admin can assign or change the super_admin role",
        });
      }
      // Normal admins cannot demote/suspend other admins via this path for role change from admin
      if (
        (user.role === "admin" || user.role === "super_admin") &&
        !isSuperAdmin(actor?.role) &&
        req.body.role !== user.role
      ) {
        return res.status(403).json({
          message: "Only a super admin can change admin roles",
        });
      }
      // Prevent removing the last active admin
      if (
        (user.role === "admin" || user.role === "super_admin") &&
        req.body.role !== "admin" &&
        req.body.role !== "super_admin"
      ) {
        const adminCount = await User.countDocuments({
          role: { $in: ["admin", "super_admin"] },
          isActive: true,
        });
        if (adminCount <= 1) {
          return res.status(400).json({
            message: "Cannot demote the last active admin",
          });
        }
      }
      const prevRole = user.role;
      user.role = req.body.role;
      if (prevRole === "super_admin" || req.body.role === "super_admin") {
        invalidateSuperAdminIdCache();
      }
    }
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.clientType !== undefined) user.clientType = req.body.clientType;
    if (req.body.isActive !== undefined) {
      // Staff/partner accounts: admin only. CRM may activate/deactivate clients.
      if (!actorIsAdmin && user.role !== "client") {
        return res.status(403).json({
          message: "Only admins can activate or deactivate staff accounts",
        });
      }
      if (
        (user.role === "admin" || user.role === "super_admin") &&
        user.isActive &&
        req.body.isActive === false
      ) {
        if (!isSuperAdmin(actor?.role)) {
          return res.status(403).json({
            message: "Only a super admin can suspend admin accounts",
          });
        }
        const adminCount = await User.countDocuments({
          role: { $in: ["admin", "super_admin"] },
          isActive: true,
        });
        if (adminCount <= 1) {
          return res.status(400).json({
            message: "Cannot deactivate the last active admin",
          });
        }
      }
      if (req.body.isActive === false) {
        user.sessionVersion = (user.sessionVersion || 0) + 1;
      }
      user.isActive = req.body.isActive;
    }
    if (req.body.assignedConsultant !== undefined) {
      user.assignedConsultant = req.body.assignedConsultant || null;
    }
    if (req.body.expertise !== undefined) user.expertise = req.body.expertise;
    if (req.body.notes) user.notes = req.body.notes;

    const updatedUser = await user.save();

    if ((req as any).user) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Updated User",
        details: `Updated user ${updatedUser.email}`,
        req,
      });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      clientType: updatedUser.clientType,
      isActive: updatedUser.isActive,
      assignedConsultant: updatedUser.assignedConsultant,
      expertise: updatedUser.expertise,
      notes: updatedUser.notes,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin)

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!assertVisibleUser(req as any, user.role)) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({ message: "Cannot delete this account" });
    }

    if (user._id.toString() === (req as any).user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    if (user.role === "admin" && user.isActive) {
      const adminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last active admin",
        });
      }
    }

    await user.deleteOne();

    if ((req as any).user) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Deleted User",
        details: `Deleted user ${user.email}`,
        req,
      });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Forgot password – generate reset token
// @route   POST /api/users/forgot-password
// @access  Public

export const getConsultants = async (req: Request, res: Response) => {
  try {
    const consultants = await User.find({ role: "consultant", isActive: true })
      .select("name email _id expertise phone")
      .lean();

    res.json(consultants);
  } catch (error) {
    console.error("Get consultants error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Change password (authenticated user)
// @route   PUT /api/users/change-password
// @access  Private

export const exportUsers = async (req: Request, res: Response) => {
  try {
    const filter = applyUserStealthFilter(req as any, {});
    const users = await User.find(filter)
      .select("name email role phone isActive address clientType assignedConsultant lastLoginAt createdAt updatedAt")
      .populate("assignedConsultant", "name email")
      .lean();

    const header = "Name,Email,Role,Phone,Active,Address,Client Type,Assigned Consultant,Last Login,Created At,Updated At\n";

    const rows = users
      .map((u: any) =>
        [
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          u.role,
          `"${(u.phone || "").replace(/"/g, '""')}"`,
          u.isActive ? "Yes" : "No",
          `"${(u.address || "").replace(/"/g, '""')}"`,
          `"${(u.clientType || "").replace(/"/g, '""')}"`,
          `"${(u.assignedConsultant?.name || "—").replace(/"/g, '""')}"`,
          u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "—",
          u.createdAt ? new Date(u.createdAt).toISOString() : "—",
          u.updatedAt ? new Date(u.updatedAt).toISOString() : "—",
        ].join(",")
      )
      .join("\n");

    const csv = header + rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="users-export-${Date.now()}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
