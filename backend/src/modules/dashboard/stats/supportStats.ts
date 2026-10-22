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

export const supportStats = async (userId: string) => {
  const openThreads = await Message.countDocuments({
    $or: [{ recipient: userId }, { sender: userId }],
  }).catch(() => 0);
  const upcomingConsultations = await Consultation.countDocuments({
    status: "scheduled",
    dateTime: { $gte: new Date() },
  });
  const totalClients = await User.countDocuments({
    role: "client",
    isActive: true,
  });
  const pendingApps = await RentalApplication.countDocuments({
    status: "info_requested",
  });

  return {
    openThreads,
    upcomingConsultations,
    totalClients,
    pendingApplications: pendingApps,
    unreadMessages: 0,
  };
};
