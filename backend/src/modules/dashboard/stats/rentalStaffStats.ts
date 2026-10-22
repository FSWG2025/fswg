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

export const rentalStaffStats = async () => {
  const submitted = await RentalApplication.countDocuments({
    status: "submitted",
  });
  const underReview = await RentalApplication.countDocuments({
    status: "under_review",
  });
  const infoRequested = await RentalApplication.countDocuments({
    status: "info_requested",
  });
  const approved = await RentalApplication.countDocuments({
    status: "approved",
  });
  const rejected = await RentalApplication.countDocuments({
    status: "rejected",
  });
  const applicationStatuses = await RentalApplication.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return {
    pendingApplications: submitted,
    underReview,
    infoRequested,
    approved,
    rejected,
    applicationStatuses,
    myApplications: submitted + underReview + infoRequested,
  };
};
