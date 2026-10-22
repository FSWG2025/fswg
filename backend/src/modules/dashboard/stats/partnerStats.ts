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

export const partnerStats = async (userId: string, role: UserRole) => {
  if (role === "landlord_partner") {
    return {
      propertiesListed: 0,
      activeMatches: 0,
      pendingMatches: 0,
      messages: await Message.countDocuments({
        $or: [{ sender: userId }, { recipient: userId }],
      }).catch(() => 0),
    };
  }
  // referral_partner
  return {
    referralClicks: 0,
    referralSignups: 0,
    referralConverted: 0,
    inviteCode: `FSWG-${String(userId).slice(-6).toUpperCase()}`,
  };
};
