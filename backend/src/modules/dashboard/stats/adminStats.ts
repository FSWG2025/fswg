import User from "../../../models/User";
import Lead from "../../../models/Lead";
import Consultation from "../../../models/Consultation";
import RentalApplication from "../../../models/RentalApplication";
import AuditLog from "../../../models/AuditLog";
import AdvisorApplication from "../../../models/AdvisorApplication";
import Content from "../../../models/Content";
import Message from "../../../models/Message";
import type { UserRole } from "../../../constants/roles";
import { asObjectId, startOfMonth } from "./helpers";
import {
  AUDIT_NOISE_FILTER,
  getSuperAdminIds,
} from "../../../utils/superStealth";

export const adminStats = async () => {
  const totalClients = await User.countDocuments({ role: "client" });
  const totalConsultants = await User.countDocuments({ role: "consultant" });
  const activeAdvisors = await User.countDocuments({
    role: "consultant",
    isActive: true,
  });
  const totalLeads = await Lead.countDocuments();
  const newLeads = await Lead.countDocuments({ status: "new" });
  const convertedLeads = await Lead.countDocuments({ status: "converted" });
  const pendingApps = await RentalApplication.countDocuments({
    status: "submitted",
  });
  const advisorApplicants = await AdvisorApplication.countDocuments();
  const pendingAdvisorApps = await AdvisorApplication.countDocuments({
    status: "submitted",
  });

  const consultationsThisMonth = await Consultation.countDocuments({
    dateTime: { $gte: startOfMonth() },
  });
  const totalConsultations = await Consultation.countDocuments();
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Never surface super_admin activity or raw HTTP-path noise on the admin dashboard
  const superIds = await getSuperAdminIds();
  const stealth: Record<string, unknown> = {
    ...AUDIT_NOISE_FILTER,
    superOnly: { $ne: true },
    "metadata.superOnly": { $ne: true },
  };
  if (superIds.length) {
    stealth.$or = [
      { user: { $exists: false } },
      { user: null },
      { user: { $nin: superIds } },
    ];
  }

  const recentRaw = await AuditLog.find(stealth)
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("user", "name role");

  const recentActivities = recentRaw
    .filter((log: any) => log.user?.role !== "super_admin")
    .slice(0, 10);

  const leadInterests = await Lead.aggregate([
    { $group: { _id: "$interest", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const consultationTrend = await Consultation.aggregate([
    { $match: { dateTime: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$dateTime" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalClients,
    totalConsultants,
    activeAdvisors,
    totalLeads,
    newLeads,
    convertedLeads,
    conversionRate,
    pendingApplications: pendingApps,
    advisorApplicants,
    pendingAdvisorApps,
    consultationsThisMonth,
    totalConsultations,
    leadInterests,
    consultationTrend,
    recentActivity: recentActivities.map((log: any) => ({
      user: log.user?.name || "Unknown",
      action: log.action,
      details: log.details,
      date: log.createdAt,
    })),
  };
};
