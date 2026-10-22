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
import { isFeatureEnabled } from "../../middleware/maintenanceGate";
import { getSystemSettings } from "../../models/SystemSettings";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, address, clientType } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const registrationOn = await isFeatureEnabled("registration");
    const actorIsAdmin = isPlatformAdmin((req as any).user?.role);
    if (!registrationOn && !actorIsAdmin) {
      res.status(503).json({
        message: "Registration is temporarily closed. Please try again later.",
        code: "FEATURE_DISABLED",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    const userRole = role || "client";
    if (!isUserRole(userRole)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    // Self-register is always client; staff/partner roles require an authenticated admin
    if (userRole !== "client") {
      if (!(req as any).user || !isPlatformAdmin((req as any).user.role)) {
        res.status(403).json({
          message: "Only admins can create non-client accounts",
        });
        return;
      }
      if (userRole === "super_admin" && !isSuperAdmin((req as any).user.role)) {
        res.status(403).json({
          message: "Only a super admin can create another super admin",
        });
        return;
      }
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone: phone || "",
      address: address || "",
      clientType: clientType || undefined,
    });

    if (newUser) {
      generateToken(newUser._id.toString(), res, {
        sessionVersion: newUser.sessionVersion || 0,
      });

      const actorId =
        (req as any).user?._id?.toString() || newUser._id.toString();
      await logAudit({
        userId: actorId,
        action: (req as any).user ? "Registered User" : "Signed Up",
        details: `${(req as any).user ? "Admin registered" : "New signup"} ${newUser.email} (${newUser.role})`,
        resourceType: "auth",
        resourceId: newUser._id.toString(),
        req,
        res,
      });

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        clientType: newUser.clientType,
        isActive: newUser.isActive,
        message: "User registered successfully",
      });
      return;
    } else {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server Error", error: process.env.NODE_ENV === "development" ? String(error) : undefined });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: "Account is deactivated. Contact support." });
      return;
    }

    if (user.softDeletedAt) {
      res.status(403).json({ message: "Account is unavailable.", code: "SOFT_DELETED" });
      return;
    }

    const settings = await getSystemSettings();
    if (
      settings.blockNewSessionsByRole?.includes(user.role) &&
      !isSuperAdmin(user.role)
    ) {
      res.status(403).json({
        message: "New sessions for this role are currently blocked.",
        code: "ROLE_SESSION_BLOCKED",
      });
      return;
    }
    if (settings.lockdown && !isSuperAdmin(user.role)) {
      res.status(503).json({
        message: "Platform lockdown is active.",
        code: "LOCKDOWN",
      });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await logAudit({
        userId: user._id.toString(),
        action: "Failed login",
        details: `Failed login attempt for ${user.email}`,
        resourceType: "auth",
        resourceId: user._id.toString(),
        req,
        res,
      });
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    user.lastLoginAt = new Date();
    user.lastActionAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id.toString(), res, {
      sessionVersion: user.sessionVersion || 0,
    });

    await logAudit({
      userId: user._id.toString(),
      action: "Logged In",
      details: `User ${user.email} logged in`,
      resourceType: "auth",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      clientType: user.clientType,
      isActive: user.isActive,
      assignedConsultant: user.assignedConsultant,
      notes: user.notes,
      expertise: user.expertise,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server Error", error: process.env.NODE_ENV === "development" ? String(error) : undefined });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public

export const logoutUser = async (req: Request, res: Response) => {
  try {
    if ((req as any).user) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Logged Out",
        details: `User ${(req as any).user.email || (req as any).user._id} logged out`,
        resourceType: "auth",
        resourceId: (req as any).user._id.toString(),
        req,
        res,
      });
    }

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: `If an account with ${email} exists, a reset link has been sent.` });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    res.json({
      message: "Password reset token generated.",
      resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
      expiresIn: "30 minutes",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

// @desc    Reset password using token
// @route   POST /api/users/reset-password/:token
// @access  Public

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password is required and must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    generateToken(user._id.toString(), res, {
      sessionVersion: user.sessionVersion,
    });

    await logAudit({
      userId: user._id.toString(),
      action: "Reset Password",
      details: `Password reset for ${user.email}`,
      resourceType: "auth",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get consultant list (for booking dropdown)
// @route   GET /api/users/consultants
// @access  Private (any authenticated user)

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user?._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();

    // Re-issue cookie so the current session stays valid after revoke bump
    generateToken(user._id.toString(), res, {
      sessionVersion: user.sessionVersion,
    });

    await logAudit({
      userId: user._id.toString(),
      action: "Changed Password",
      details: "Password changed successfully",
      resourceType: "auth",
      resourceId: user._id.toString(),
      req,
      res,
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Export all users as detailed CSV (admin only)
// @route   GET /api/users/export
// @access  Private/Admin
