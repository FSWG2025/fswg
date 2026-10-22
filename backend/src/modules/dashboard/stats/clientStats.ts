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

export const clientStats = async (userId: string) => {
  const myApplications = await RentalApplication.countDocuments({
    applicant: userId,
  });
  const upcomingConsultations = await Consultation.countDocuments({
    client: userId,
    dateTime: { $gte: new Date() },
    status: "scheduled",
  });
  const totalConsultations = await Consultation.countDocuments({
    client: userId,
  });

  const upcomingConsultationsList = await Consultation.find({
    client: userId,
    dateTime: { $gte: new Date() },
    status: "scheduled",
  })
    .populate("service", "title category")
    .populate("consultant", "name email")
    .sort({ dateTime: 1 })
    .limit(5)
    .lean();

  const firstConsultation = upcomingConsultationsList[0];
  const nextAppointment = firstConsultation?.dateTime
    ? new Date(firstConsultation.dateTime as Date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const applicationStatuses = await RentalApplication.aggregate([
    { $match: { applicant: asObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const clientProfile = await User.findById(userId)
    .select("assignedConsultant phone clientType")
    .populate("assignedConsultant", "name email expertise phone")
    .lean();

  return {
    myApplications,
    upcomingConsultations,
    totalConsultations,
    nextAppointment,
    upcomingConsultationsList,
    applicationStatuses,
    assignedConsultant: (clientProfile as any)?.assignedConsultant || null,
    clientType: (clientProfile as any)?.clientType || null,
  };
};
