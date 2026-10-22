import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import User from "../../models/User";
import Lead from "../../models/Lead";
import RentalApplication from "../../models/RentalApplication";
import Consultation from "../../models/Consultation";
import SiteVisitor from "../../models/SiteVisitor";
import AuditLog from "../../models/AuditLog";
import ApprovalRequest from "../../models/ApprovalRequest";
import BotBlock from "../../models/BotBlock";
import {
  getSystemSettings,
  deriveSystemStatus,
} from "../../models/SystemSettings";
import { INTERNAL_ROLES } from "../../constants/roles";

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getPulse = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSystemSettings();
    const t5 = minutesAgo(5);
    const t15 = minutesAgo(15);
    const t60 = minutesAgo(60);
    const today = startOfToday();

    const [
      activeStaff5,
      activeStaff15,
      activeClients15,
      livePageviews5,
      uniqueVisitors15,
      leadsToday,
      leadsHour,
      rentalsByStatus,
      openConsultations,
      videoishConsultations,
      failedLoginsHour,
      approvalsPending,
      recentErrors,
      botsBlockedToday,
      staffOnline,
    ] = await Promise.all([
      User.countDocuments({
        role: { $in: INTERNAL_ROLES },
        lastActionAt: { $gte: t5 },
        isActive: true,
      }),
      User.countDocuments({
        role: { $in: INTERNAL_ROLES },
        lastActionAt: { $gte: t15 },
        isActive: true,
      }),
      User.countDocuments({
        role: "client",
        lastActionAt: { $gte: t15 },
        isActive: true,
      }),
      SiteVisitor.countDocuments({ lastSeenAt: { $gte: t5 } }),
      SiteVisitor.countDocuments({ lastSeenAt: { $gte: t15 } }),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: t60 } }),
      RentalApplication.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Consultation.countDocuments({
        status: "scheduled",
        dateTime: { $gte: minutesAgo(24 * 60) },
      }),
      Consultation.countDocuments({
        status: "scheduled",
        dateTime: {
          $gte: minutesAgo(30),
          $lte: new Date(Date.now() + 30 * 60_000),
        },
      }),
      AuditLog.countDocuments({
        action: { $regex: /fail|invalid|unauthor/i },
        createdAt: { $gte: t60 },
      }),
      ApprovalRequest.countDocuments({ status: "pending" }),
      AuditLog.countDocuments({
        createdAt: { $gte: t60 },
        $or: [
          { action: { $regex: /error|fail|5xx|denied/i } },
          { "metadata.statusCode": { $gte: 500 } },
        ],
      }),
      BotBlock.countDocuments({ createdAt: { $gte: today } }),
      User.find({
        role: { $in: INTERNAL_ROLES },
        isActive: true,
        lastActionAt: { $gte: t60 },
      })
        .select("name email role lastActionAt lastLoginAt")
        .sort({ lastActionAt: -1 })
        .limit(40)
        .lean(),
    ]);

    const rentalMap: Record<string, number> = {};
    for (const row of rentalsByStatus) {
      rentalMap[row._id || "unknown"] = row.count;
    }

    // Anomaly radar (heuristic, explainable)
    const anomalies: {
      id: string;
      severity: "info" | "warn" | "critical";
      title: string;
      why: string;
      href?: string;
    }[] = [];

    if (failedLoginsHour >= 10) {
      anomalies.push({
        id: "failed_logins",
        severity: "critical",
        title: `${failedLoginsHour} failed auth signals in 60m`,
        why: "Why am I seeing this? Failed login / denial audit entries spiked above the 10/hour threshold.",
        href: "/dashboard/super/security",
      });
    }
    if (livePageviews5 >= 80) {
      anomalies.push({
        id: "visitor_flood",
        severity: "warn",
        title: "Visitor flood in last 5 minutes",
        why: "Why am I seeing this? Unique visitors lastSeen in 5m exceeded 80 — possible campaign or scraper.",
        href: "/dashboard/super/visitors",
      });
    }
    if (leadsHour === 0 && leadsToday > 5) {
      anomalies.push({
        id: "lead_drop",
        severity: "info",
        title: "Lead velocity stalled this hour",
        why: "Why am I seeing this? There were leads today but none in the last 60 minutes.",
        href: "/dashboard/super/omniscience",
      });
    }
    if (botsBlockedToday >= 5) {
      anomalies.push({
        id: "bots",
        severity: "warn",
        title: `${botsBlockedToday} bots blocked today`,
        why: "Why am I seeing this? Bot guard scored and blocked automated traffic repeatedly.",
        href: "/dashboard/super/security",
      });
    }

    const idleStaff = staffOnline.filter((s) => {
      const last = s.lastActionAt ? new Date(s.lastActionAt).getTime() : 0;
      return Date.now() - last > 15 * 60_000;
    });

    res.json({
      status: deriveSystemStatus(settings),
      settingsSummary: {
        maintenanceMode: settings.maintenanceMode,
        lockdown: settings.lockdown,
        readOnlyMode: settings.readOnlyMode,
        freezeLeadIntake: settings.freezeLeadIntake,
        freezeMessaging: settings.freezeMessaging,
        botBlockEnabled: settings.botBlockEnabled,
      },
      sessions: {
        staffActive5m: activeStaff5,
        staffActive15m: activeStaff15,
        clientsActive15m: activeClients15,
      },
      traffic: {
        liveVisitors5m: livePageviews5,
        uniqueVisitors15m: uniqueVisitors15,
      },
      leads: {
        today: leadsToday,
        lastHour: leadsHour,
      },
      rentals: rentalMap,
      consultations: {
        open: openConsultations,
        liveRooms: videoishConsultations,
      },
      security: {
        failedSignals60m: failedLoginsHour,
        errorSignals60m: recentErrors,
        botsBlockedToday,
      },
      queues: {
        approvalsPending,
      },
      anomalies,
      staffHeartbeat: staffOnline.map((s) => ({
        id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        lastActionAt: s.lastActionAt,
        idle: idleStaff.some((i) => String(i._id) === String(s._id)),
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Pulse error:", error);
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
