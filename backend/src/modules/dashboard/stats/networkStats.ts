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

export const networkStats = async (userId?: string, asMentor = false) => {
  const submitted = await AdvisorApplication.countDocuments({
    status: "submitted",
  });
  const underReview = await AdvisorApplication.countDocuments({
    status: "under_review",
  });
  const approved = await AdvisorApplication.countDocuments({
    status: "approved",
  });
  const enrolled = await AdvisorApplication.countDocuments({
    status: "enrolled",
  });
  const rejected = await AdvisorApplication.countDocuments({
    status: "rejected",
  });

  let mentees = 0;
  let myApplication = null;
  if (asMentor && userId) {
    mentees = await AdvisorApplication.countDocuments({
      assignedMentor: userId,
      status: { $in: ["approved", "enrolled", "under_review"] },
    });
  }
  if (userId) {
    myApplication = await AdvisorApplication.findOne({ applicant: userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  return {
    submitted,
    underReview,
    approved,
    enrolled,
    rejected,
    mentees,
    advisorApplicants: submitted + underReview + approved + enrolled,
    pendingAdvisorApps: submitted,
    myApplication,
    trainingProgress: myApplication
      ? Math.round(
          (((myApplication as any).trainingModules || []).filter(
            (m: any) => m.completed
          ).length /
            Math.max(
              ((myApplication as any).trainingModules || []).length,
              1
            )) *
            100
        )
      : 0,
  };
};
