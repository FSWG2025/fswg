import { type Request, type Response } from "express";
import RentalApplication from '../../models/RentalApplication';
import { logAudit } from '../../utils/logAudit';
import {
  hasRole,
  RENTAL_APPROVE_ROLES,
  RENTAL_STAFF_ROLES,
} from '../../constants/roles';
import { notifyAdminsCritical } from '../../services/adminAlerts';

const isRentalStaff = (role: string) => hasRole(role, RENTAL_STAFF_ROLES);
const canApproveRental = (role: string) => hasRole(role, RENTAL_APPROVE_ROLES);

/** Staff may move apps through review; only admins may approve/reject. */
const STAFF_STATUSES = ["submitted", "under_review", "info_requested", "cancelled"] as const;
const ADMIN_ONLY_STATUSES = ["approved", "rejected"] as const;

// @desc    Submit rental application (client)
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { personalInfo, employment, references, documents } = req.body;

    if (!personalInfo?.fullName || !personalInfo?.email || !personalInfo?.phone) {
      return res.status(400).json({ message: "Personal information (fullName, email, phone) is required" });
    }
    if (!personalInfo?.dob) {
      return res.status(400).json({ message: "Date of birth is required" });
    }
    const dob = new Date(personalInfo.dob);
    if (Number.isNaN(dob.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old to submit a rental application",
      });
    }
    if (!employment?.employerName || !employment?.monthlyIncome) {
      return res.status(400).json({ message: "Employment information (employerName, monthlyIncome) is required" });
    }

    const existing = await RentalApplication.findOne({
      applicant: (req as any).user._id,
      status: { $in: ["submitted", "under_review", "info_requested"] },
    });
    if (existing) {
      return res.status(400).json({ message: "You already have an active application under review" });
    }

    const application = await RentalApplication.create({
      applicant: (req as any).user._id,
      personalInfo,
      employment,
      references: references || [],
      documents: documents || [],
      status: "submitted",
    });

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Submitted Rental Application",
      details: `Application ${application._id} for ${personalInfo.fullName}`,
      req,
    });

    await notifyAdminsCritical({
      title: "New rental application",
      message: `${personalInfo.fullName} submitted a rental support application`,
      pushBody: "New rental application submitted",
      link: "/admin/rental-applications",
      sourceKey: `rental-app:${application._id}`,
      type: "rental",
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get applications – data isolation: clients only see own
export const getApplications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let filter: any = {};

    // Data isolation: non–rental-staff users only see their own applications
    if (!isRentalStaff(user.role)) {
      filter.applicant = user._id;
    }

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { "personalInfo.fullName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const [total, applications] = await Promise.all([
      RentalApplication.countDocuments(filter),
      RentalApplication.find(filter)
        .populate("applicant", "name email phone")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    // Remove internalNotes from response for non–rental-staff users
    const sanitizedApps = applications.map((app) => {
      const appObj = app.toObject();
      if (!isRentalStaff(user.role)) {
        const { internalNotes, ...safe } = appObj;
        return safe;
      }
      return appObj;
    });

    res.json({
      applications: sanitizedApps,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get single application – owner or admin/consultant
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const application = await RentalApplication.findById(req.params.id)
      .populate("applicant", "name email phone address")
      .populate("reviewedBy", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const user = (req as any).user;
    if (
      !isRentalStaff(user.role) &&
      application.applicant._id.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const appObj = application.toObject();
    if (!isRentalStaff(user.role)) {
      const { internalNotes, ...safe } = appObj;
      return res.json(safe);
    }

    res.json(appObj);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update application status (staff) + internal notes; approve/reject = admin only
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { status, comments, internalNotes, reason } = req.body;
    const actor = (req as any).user;
    const application = await RentalApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const oldStatus = application.status;

    if (status) {
      const allAllowed = [...STAFF_STATUSES, ...ADMIN_ONLY_STATUSES];
      if (!allAllowed.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${allAllowed.join(", ")}`,
        });
      }

      if (
        (ADMIN_ONLY_STATUSES as readonly string[]).includes(status) &&
        !canApproveRental(actor?.role)
      ) {
        return res.status(403).json({
          message: "Only admins can approve or reject rental applications",
        });
      }

      // Rejection requires a reason
      if (status === "rejected") {
        if (!reason || !reason.trim()) {
          return res.status(400).json({
            message: "A rejection reason is required.",
          });
        }
        application.comments.push(`[REJECTED] Reason: ${reason.trim()}`);
      }

      if (status === "approved" && reason && reason.trim()) {
        application.comments.push(`[APPROVED] Note: ${reason.trim()}`);
      }

      application.status = status;
    }

    // Public comments (visible to applicant)
    if (comments) {
      if (Array.isArray(comments)) {
        application.comments = comments;
      } else {
        application.comments.push(comments);
      }
    }

    // Private internal notes (staff only — route already gated)
    if (internalNotes) {
      if (Array.isArray(internalNotes)) {
        application.internalNotes = internalNotes;
      } else {
        application.internalNotes.push(internalNotes);
      }
    }

    // Never trust client-supplied reviewedBy
    if (actor?._id) {
      application.reviewedBy = actor._id;
    }

    const updated = await application.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Updated Rental Application",
      details: `Application ${updated._id} status ${oldStatus} → ${updated.status}${reason ? ` – Reason: ${reason}` : ""}`,
      resourceType: "rental_application",
      resourceId: updated._id.toString(),
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete application (admin)
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const application = await RentalApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted Rental Application",
      details: `Deleted application ${req.params.id}`,
      req,
    });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Request additional information
export const requestInformation = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    const application = await RentalApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = "info_requested";
    application.comments.push(`[INFO REQUEST]: ${message}`);
    application.reviewedBy = (req as any).user._id;

    const updated = await application.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Requested Info for Rental Application",
      details: `Application ${updated._id} - Requested additional information`,
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};