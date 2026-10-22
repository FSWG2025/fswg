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

export const consultantStats = async (userId: string) => {
  const myLeads = await Lead.countDocuments({ assignedConsultant: userId });
  const newMyLeads = await Lead.countDocuments({
    assignedConsultant: userId,
    status: "new",
  });
  const upcomingConsultations = await Consultation.countDocuments({
    consultant: userId,
    status: "scheduled",
    dateTime: { $gte: new Date() },
  });
  const completedConsultations = await Consultation.countDocuments({
    consultant: userId,
    status: "completed",
  });
  const myClients = await User.countDocuments({
    assignedConsultant: userId,
    role: "client",
  });
  const pendingApps = await RentalApplication.countDocuments({
    status: { $in: ["submitted", "under_review", "info_requested"] },
  });
  const unreadMessages = await Message.countDocuments({
    recipient: userId,
    read: false,
  }).catch(() => 0);

  const leadsByStatus = await Lead.aggregate([
    { $match: { assignedConsultant: asObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    myLeads,
    newMyLeads,
    upcomingConsultations,
    completedConsultations,
    myClients,
    pendingApplications: pendingApps,
    unreadMessages,
    leadsByStatus,
  };
};
