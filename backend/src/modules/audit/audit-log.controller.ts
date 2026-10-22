import { type Request, type Response } from "express";
import AuditLog from "../../models/AuditLog";
import {
  auditVisibilityFilter,
  getSuperAdminIds,
  viewerIsSuper,
} from "../../utils/superStealth";

// @desc    Get audit logs (admin)
// @route   GET /api/audit-logs
// @access  Private/Admin
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;
    const action = req.query.action as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const filter: any = {
      ...(await auditVisibilityFilter(req as any)),
    };

    if (userId) {
      // Non-supers cannot query a super's id
      if (!viewerIsSuper(req as any)) {
        const supers = await getSuperAdminIds();
        if (supers.includes(String(userId))) {
          return res.json({
            logs: [],
            pagination: { total: 0, page, pages: 0 },
          });
        }
      }
      filter.user = userId;
    }
    if (action) filter.action = { $regex: action, $options: "i" };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Belt-and-suspenders: never return a populated super_admin actor to non-supers
    const safe = viewerIsSuper(req as any)
      ? logs
      : logs.filter((l: any) => l.user?.role !== "super_admin");

    res.json({
      logs: safe,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get recent audit logs
// @route   GET /api/audit-logs/recent
// @access  Private/Admin
export const getRecentLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const stealth = await auditVisibilityFilter(req as any);

    // Over-fetch then filter so populate edge-cases still drop supers
    const raw = await AuditLog.find(stealth)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(viewerIsSuper(req as any) ? limit : limit * 3);

    const logs = viewerIsSuper(req as any)
      ? raw.slice(0, limit)
      : raw
          .filter((l: any) => l.user?.role !== "super_admin")
          .slice(0, limit);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Action breakdown for activity filters / charts
// @route   GET /api/audit-logs/summary
// @access  Private/Admin
export const getAuditSummary = async (req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const stealth = await auditVisibilityFilter(req as any);
    const match = { createdAt: { $gte: since }, ...stealth };

    const [byAction, authEvents, total] = await Promise.all([
      AuditLog.aggregate([
        { $match: match },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
      AuditLog.countDocuments({
        ...match,
        action: {
          $in: [
            "Logged In",
            "Logged Out",
            "Signed Up",
            "Reset Password",
            "Changed Password",
          ],
        },
      }),
      AuditLog.countDocuments(match),
    ]);

    res.json({
      totalLast30Days: total,
      authEventsLast30Days: authEvents,
      topActions: byAction.map((a) => ({ action: a._id, count: a.count })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Clear old audit logs
// @route   DELETE /api/audit-logs/clear
// @access  Private/Admin
export const clearOldLogs = async (req: Request, res: Response) => {
  try {
    // Only supers may purge; never allow wiping stealth history via normal admin
    if (!viewerIsSuper(req as any)) {
      return res.status(403).json({
        message: "Not authorized to clear audit logs",
      });
    }

    const days = parseInt(req.query.days as string) || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoffDate } });

    res.json({
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
