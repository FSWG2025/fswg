import type { Response } from "express";
import ApprovalRequest, {
  APPROVAL_ACTION_TYPES,
  type ApprovalActionType,
} from "../../models/ApprovalRequest";
import RentalApplication from "../../models/RentalApplication";
import AdvisorApplication from "../../models/AdvisorApplication";
import User from "../../models/User";
import Notification from "../../models/Notification";
import { logAudit } from "../../utils/logAudit";
import type { AuthRequest } from "../../middleware/auth";
import {
  isUserRole,
  isPlatformAdmin,
  isSuperAdmin,
} from "../../constants/roles";
import { notifyAdminsCritical } from "../../services/adminAlerts";

const STAFF_REQUEST_ROLES = new Set([
  "admin",
  "consultant",
  "ops_manager",
  "rental_specialist",
  "underwriter",
  "network_manager",
  "mentor",
  "support_agent",
]);

const executeApproval = async (
  type: ApprovalActionType,
  resourceId: string,
  payload: Record<string, any>,
  actorId: string,
) => {
  switch (type) {
    case "rental_approve":
    case "rental_reject": {
      const app = await RentalApplication.findById(resourceId);
      if (!app) throw new Error("Rental application not found");
      const status = type === "rental_approve" ? "approved" : "rejected";
      if (status === "rejected") {
        const reason = String(payload.reason || "").trim();
        if (!reason) throw new Error("A rejection reason is required");
        app.comments.push(`[REJECTED] Reason: ${reason}`);
      } else if (payload.reason) {
        app.comments.push(`[APPROVED] Note: ${String(payload.reason).trim()}`);
      }
      app.status = status;
      app.reviewedBy = actorId as any;
      await app.save();
      return { kind: "rental_application", id: app._id, status };
    }
    case "advisor_approve":
    case "advisor_reject":
    case "advisor_enroll": {
      const app = await AdvisorApplication.findById(resourceId);
      if (!app) throw new Error("Advisor application not found");
      const status =
        type === "advisor_approve"
          ? "approved"
          : type === "advisor_reject"
            ? "rejected"
            : "enrolled";
      app.status = status;
      if (payload.note) app.notes.push(String(payload.note));
      await app.save();
      return { kind: "advisor_application", id: app._id, status };
    }
    case "user_delete": {
      const user = await User.findById(resourceId);
      if (!user) throw new Error("User not found");
      if (user._id.toString() === actorId) {
        throw new Error("Cannot delete your own account");
      }
      // Never delete super_admin via the approval queue
      if (user.role === "super_admin") {
        throw new Error("Cannot delete a super admin via approvals");
      }
      if (user.role === "admin" && user.isActive) {
        const adminCount = await User.countDocuments({
          role: { $in: ["admin", "super_admin"] },
          isActive: true,
        });
        if (adminCount <= 1) {
          throw new Error("Cannot delete the last active admin");
        }
      }
      await user.deleteOne();
      return { kind: "user", id: resourceId, deleted: true };
    }
    case "user_role_change": {
      const user = await User.findById(resourceId);
      if (!user) throw new Error("User not found");
      const nextRole = payload.role;
      if (!isUserRole(nextRole)) throw new Error("Invalid role");
      // God-mode role can never be granted or altered through this queue
      if (nextRole === "super_admin" || user.role === "super_admin") {
        throw new Error(
          "super_admin role changes are not allowed via the approval queue",
        );
      }
      if (user.role === "admin" && nextRole !== "admin") {
        const adminCount = await User.countDocuments({
          role: { $in: ["admin", "super_admin"] },
          isActive: true,
        });
        if (adminCount <= 1) {
          throw new Error("Cannot demote the last active admin");
        }
      }
      user.role = nextRole;
      user.sessionVersion = (user.sessionVersion || 0) + 1;
      await user.save();
      return { kind: "user", id: user._id, role: user.role };
    }
    case "user_deactivate": {
      const user = await User.findById(resourceId);
      if (!user) throw new Error("User not found");
      if (user.role === "super_admin") {
        throw new Error("Cannot deactivate a super admin via approvals");
      }
      if (user.role === "admin" && user.isActive) {
        const adminCount = await User.countDocuments({
          role: { $in: ["admin", "super_admin"] },
          isActive: true,
        });
        if (adminCount <= 1) {
          throw new Error("Cannot deactivate the last active admin");
        }
      }
      user.isActive = false;
      user.sessionVersion = (user.sessionVersion || 0) + 1;
      await user.save();
      return { kind: "user", id: user._id, isActive: false };
    }
    default:
      throw new Error("Unsupported approval type");
  }
};

// @desc    List approval requests
// @route   GET /api/approvals
export const listApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    const status = (req.query.status as string) || "pending";
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const filter: any = {};
    if (status !== "all") filter.status = status;
    if (!isPlatformAdmin(me.role)) filter.requestedBy = me._id;

    const [total, requests] = await Promise.all([
      ApprovalRequest.countDocuments(filter),
      ApprovalRequest.find(filter)
        .populate("requestedBy", "name email role")
        .populate("reviewedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      requests,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to list approvals" });
  }
};

// @desc    Create approval request (staff) — admins may also queue for audit trail
// @route   POST /api/approvals
export const createApproval = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    if (!STAFF_REQUEST_ROLES.has(me.role)) {
      return res.status(403).json({ message: "Not authorized to request approvals" });
    }

    const { type, resourceType, resourceId, title, summary, payload } = req.body;

    if (!APPROVAL_ACTION_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid approval type" });
    }
    if (!resourceType || !resourceId || !title || !summary) {
      return res.status(400).json({
        message: "resourceType, resourceId, title, and summary are required",
      });
    }

    // Block privilege-escalation payloads at request time
    if (
      type === "user_role_change" &&
      payload &&
      typeof payload === "object" &&
      (payload as any).role === "super_admin"
    ) {
      return res.status(403).json({
        message: "Cannot request super_admin via the approval queue",
      });
    }
    if (
      (type === "user_delete" ||
        type === "user_deactivate" ||
        type === "user_role_change") &&
      resourceId
    ) {
      const target = await User.findById(resourceId).select("role").lean();
      if (target?.role === "super_admin") {
        return res.status(403).json({
          message: "Cannot target a super admin via the approval queue",
        });
      }
    }

    // Prevent duplicate pending requests for the same action on the same resource
    const existing = await ApprovalRequest.findOne({
      type,
      resourceId: String(resourceId),
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({
        message: "A pending approval already exists for this action",
        request: existing,
      });
    }

    const request = await ApprovalRequest.create({
      type,
      resourceType: String(resourceType),
      resourceId: String(resourceId),
      title: String(title).slice(0, 200),
      summary: String(summary).slice(0, 1000),
      payload: payload && typeof payload === "object" ? payload : {},
      requestedBy: me._id,
      status: "pending",
    });

    await logAudit({
      userId: me._id.toString(),
      action: "Requested Admin Approval",
      details: `${type} on ${resourceType}/${resourceId}: ${title}`,
      resourceType: "approval_request",
      resourceId: request._id.toString(),
      req,
    });

    await notifyAdminsCritical({
      title: "Approval needed",
      message: `${me.name} requested: ${title}`,
      pushBody: "New item in the approval queue",
      link: "/admin/approvals",
      sourceKey: `approval:${request._id}`,
      type: "system",
    });

    const populated = await ApprovalRequest.findById(request._id).populate(
      "requestedBy",
      "name email role",
    );

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create approval" });
  }
};

// @desc    Admin approves → execute critical action
// @route   PATCH /api/approvals/:id/approve
export const approveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    if (!isPlatformAdmin(me.role)) {
      return res.status(403).json({ message: "Only admins can approve requests" });
    }

    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }
    // No self-approval (requester cannot rubber-stamp their own request)
    if (String(request.requestedBy) === String(me._id) && !isSuperAdmin(me.role)) {
      return res.status(403).json({
        message: "You cannot approve your own request",
      });
    }

    let result;
    try {
      result = await executeApproval(
        request.type,
        request.resourceId,
        request.payload || {},
        me._id.toString(),
      );
    } catch (err: any) {
      return res.status(400).json({ message: err.message || "Could not execute action" });
    }

    request.status = "approved";
    request.reviewedBy = me._id;
    request.reviewedAt = new Date();
    request.reviewNote = req.body.note ? String(req.body.note).slice(0, 1000) : undefined;
    await request.save();

    await logAudit({
      userId: me._id.toString(),
      action: "Approved Critical Action",
      details: `Approved ${request.type} (${request.title})`,
      resourceType: "approval_request",
      resourceId: request._id.toString(),
      req,
    });

    // Notify requester
    await Notification.create({
      user: request.requestedBy,
      title: "Request approved",
      message: `Admin approved: ${request.title}`,
      type: "system",
      link: "/admin/approvals",
      sourceKey: `approval-done:${request._id}`,
    }).catch(() => null);

    const populated = await ApprovalRequest.findById(request._id)
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role");

    res.json({ request: populated, result });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to approve" });
  }
};

// @desc    Admin rejects request (no side effects)
// @route   PATCH /api/approvals/:id/reject
export const rejectRequest = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    if (!isPlatformAdmin(me.role)) {
      return res.status(403).json({ message: "Only admins can reject requests" });
    }

    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = "rejected";
    request.reviewedBy = me._id;
    request.reviewedAt = new Date();
    request.reviewNote = req.body.note
      ? String(req.body.note).slice(0, 1000)
      : "Rejected by admin";
    await request.save();

    await logAudit({
      userId: me._id.toString(),
      action: "Rejected Critical Action Request",
      details: `Rejected ${request.type} (${request.title})`,
      resourceType: "approval_request",
      resourceId: request._id.toString(),
      req,
    });

    await Notification.create({
      user: request.requestedBy,
      title: "Request declined",
      message: `Admin declined: ${request.title}${request.reviewNote ? ` — ${request.reviewNote}` : ""}`,
      type: "system",
      link: "/admin/approvals",
      sourceKey: `approval-rej:${request._id}`,
    }).catch(() => null);

    const populated = await ApprovalRequest.findById(request._id)
      .populate("requestedBy", "name email role")
      .populate("reviewedBy", "name email role");

    res.json({ request: populated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to reject" });
  }
};

// @desc    Cancel own pending request
// @route   DELETE /api/approvals/:id
export const cancelRequest = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }
    const isOwner = request.requestedBy.toString() === me._id.toString();
    if (!isOwner && !isPlatformAdmin(me.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "cancelled";
    request.reviewedBy = me._id;
    request.reviewedAt = new Date();
    request.reviewNote = "Cancelled";
    await request.save();

    res.json({ message: "Request cancelled", request });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to cancel" });
  }
};

// @desc    Pending count for badges
// @route   GET /api/approvals/pending-count
export const pendingCount = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "admin") {
      return res.json({ count: 0 });
    }
    const count = await ApprovalRequest.countDocuments({ status: "pending" });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to count" });
  }
};
