import { type Request, type Response } from "express";
import AdvisorApplication from '../../models/AdvisorApplication';
import { logAudit } from '../../utils/logAudit';
import { ADVISOR_APPROVE_ROLES, hasRole } from '../../constants/roles';
import { notifyAdminsCritical } from '../../services/adminAlerts';

const ADMIN_ONLY_ADVISOR_STATUSES = ["approved", "rejected", "enrolled"] as const;
const STAFF_ADVISOR_STATUSES = ["submitted", "under_review"] as const;

// @desc    Submit a new advisor application
// @route   POST /api/advisor-applications
// @access  Private (any authenticated user)
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user?.role;
    if (role === "admin") {
      return res.status(403).json({
        message: "Admins cannot apply for financial advisor roles",
      });
    }

    const { fullName, email, phone, currentOccupation, motivation, insuranceInterest } = req.body;

    if (!fullName || !email || !phone || !motivation || !insuranceInterest) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existing = await AdvisorApplication.findOne({
      applicant: (req as any).user._id,
      status: { $nin: ["rejected"] },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a pending or approved application",
      });
    }

    const application = await AdvisorApplication.create({
      applicant: (req as any).user._id,
      fullName,
      email,
      phone,
      currentOccupation: currentOccupation || "",
      motivation,
      insuranceInterest,
      status: "submitted",
    });

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Submitted Advisor Application",
      details: `Application ${application._id} for ${fullName}`,
      req,
    });

    await notifyAdminsCritical({
      title: "New advisor application",
      message: `${fullName} applied to join the advisor network`,
      pushBody: "New advisor application submitted",
      link: "/admin/advisor-applications",
      sourceKey: `advisor-app:${application._id}`,
      type: "network",
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all advisor applications (admin)
// @route   GET /api/advisor-applications
// @access  Private/Admin
export const getApplications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [total, applications] = await Promise.all([
      AdvisorApplication.countDocuments(filter),
      AdvisorApplication.find(filter)
        .populate("applicant", "name email phone")
        .populate("assignedMentor", "name email expertise")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      applications,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get single advisor application
// @route   GET /api/advisor-applications/:id
// @access  Private/Admin
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const application = await AdvisorApplication.findById(req.params.id)
      .populate("applicant", "name email phone")
      .populate("assignedMentor", "name email expertise");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update advisor application (admin: change status, assign mentor, training)
// @route   PATCH /api/advisor-applications/:id
// @access  Private/Admin
export const updateApplication = async (req: Request, res: Response) => {
  try {
    const application = await AdvisorApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const actorRole = (req as any).user?.role;
    const isAdminActor = hasRole(actorRole, ADVISOR_APPROVE_ROLES);

    // Update status with validation — approve/reject/enroll = admin only
    if (req.body.status) {
      const allowedStatuses = [
        ...STAFF_ADVISOR_STATUSES,
        ...ADMIN_ONLY_ADVISOR_STATUSES,
      ];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
        });
      }
      if (
        (ADMIN_ONLY_ADVISOR_STATUSES as readonly string[]).includes(
          req.body.status,
        ) &&
        !isAdminActor
      ) {
        return res.status(403).json({
          message:
            "Only admins can approve, reject, or enroll advisor applications",
        });
      }
      application.status = req.body.status;
    }

    // Assign mentor (network staff OK)
    if (req.body.assignedMentor !== undefined) {
      application.assignedMentor = req.body.assignedMentor || null;
    }

    // Update training modules
    if (req.body.trainingModules) {
      if (Array.isArray(req.body.trainingModules)) {
        application.trainingModules = req.body.trainingModules;
      } else {
        return res.status(400).json({ message: "trainingModules must be an array" });
      }
    }

    // Add or set notes
    if (req.body.notes) {
      if (Array.isArray(req.body.notes)) {
        application.notes = req.body.notes;
      } else {
        application.notes.push(req.body.notes);
      }
    }

    // Applicant PII edits — admin only (prevents staff rewriting identity mid-review)
    if (
      req.body.fullName ||
      req.body.email ||
      req.body.phone ||
      req.body.currentOccupation !== undefined ||
      req.body.motivation ||
      req.body.insuranceInterest
    ) {
      if (!isAdminActor) {
        return res.status(403).json({
          message: "Only admins can edit applicant profile fields",
        });
      }
      if (req.body.fullName) application.fullName = req.body.fullName;
      if (req.body.email) application.email = req.body.email;
      if (req.body.phone) application.phone = req.body.phone;
      if (req.body.currentOccupation !== undefined) {
        application.currentOccupation = req.body.currentOccupation;
      }
      if (req.body.motivation) application.motivation = req.body.motivation;
      if (req.body.insuranceInterest) {
        application.insuranceInterest = req.body.insuranceInterest;
      }
    }

    const updated = await application.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Updated Advisor Application",
      details: `Application ${updated._id} for ${updated.fullName} - Status: ${updated.status}`,
      req,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete advisor application
// @route   DELETE /api/advisor-applications/:id
// @access  Private/Admin
export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const application = await AdvisorApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted Advisor Application",
      details: `Deleted application ${req.params.id} for ${application.fullName}`,
      req,
    });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get my applications (for logged-in user)
// @route   GET /api/advisor-applications/my
// @access  Private
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const applications = await AdvisorApplication.find({
      applicant: (req as any).user._id,
    })
      .populate("assignedMentor", "name email expertise")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};