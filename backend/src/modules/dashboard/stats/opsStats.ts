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
import { adminStats } from "./adminStats";

export const opsStats = async () => {
  const base = await adminStats();
  const unassignedLeads = await Lead.countDocuments({
    assignedConsultant: null,
    status: { $in: ["new", "contacted", "qualified"] },
  });
  const activeConsultants = await User.countDocuments({
    role: "consultant",
    isActive: true,
  });
  return { ...base, unassignedLeads, activeConsultants };
};
