import { type Request, type Response } from "express";
import Consultation from '../../models/Consultation';
import { logAudit } from '../../utils/logAudit';
import { notifyAdminsCritical } from '../../services/adminAlerts';

// @desc    Book a new consultation (client or admin)
// @route   POST /api/consultations
// @access  Private
export const bookConsultation = async (req: Request, res: Response) => {
  try {
    const { clientId, consultantId, serviceId, dateTime, duration, interest, notes } = req.body;
    const user = (req as any).user;

    // Validate required fields
    if (!serviceId || !dateTime) {
      return res.status(400).json({ message: "Service and date/time are required" });
    }

    // Validate date
    const bookingDate = new Date(dateTime);
    if (isNaN(bookingDate.getTime()) || bookingDate <= new Date()) {
      return res.status(400).json({ message: "Consultation date must be in the future" });
    }

    // 🛡️ Data isolation: only admins can book for another user
    let userId = user._id;
    if (clientId) {
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can book consultations for other users" });
      }
      userId = clientId;
    }

    // Check for double booking
    const existing = await Consultation.findOne({
      client: userId,
      dateTime: bookingDate,
      status: { $in: ["scheduled", "approved"] },
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a consultation booked at this time",
      });
    }

    const consultation = await Consultation.create({
      client: userId,
      consultant: consultantId || undefined,
      service: serviceId,
      dateTime: bookingDate,
      duration: duration || 60,
      interest: interest || "",
      notes: notes || "",
      status: "scheduled",
    });

    // Log audit
    if (user) {
      await logAudit({
        userId: user._id.toString(),
        action: "Booked Consultation",
        details: `Consultation ${consultation._id} for client ${userId} - ${interest || "General"}`,
        req,
      });
    }

    const populated = await Consultation.findById(consultation._id)
      .populate("client", "name email phone")
      .populate("consultant", "name email expertise")
      .populate("service", "title category");

    // Skip self-noise when an admin books on behalf of someone
    if (user.role !== "admin") {
      await notifyAdminsCritical({
        title: "Consultation booked",
        message: `${user.name || "A client"} booked a consultation`,
        pushBody: "New consultation booked",
        link: "/bookings",
        sourceKey: `consultation:${consultation._id}`,
        type: "consultation",
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get consultations (filtered by role)
// @route   GET /api/consultations
// @access  Private
export const getConsultations = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const interest = req.query.interest as string;

    let filter: any = {};

    // Strict data isolation — never return the full book to unrelated roles
    const elevatedRoles = [
      "admin",
      "ops_manager",
      "rental_specialist",
      "support_agent",
    ];
    if (user.role === "client" || user.role === "advisor_trainee") {
      filter.client = user._id;
    } else if (user.role === "consultant" || user.role === "mentor") {
      filter.consultant = user._id;
    } else if (!elevatedRoles.includes(user.role)) {
      // content_editor, partners, etc. — no consultation inventory
      return res.json({
        consultations: [],
        pagination: { total: 0, page: 1, pages: 0 },
      });
    }

    // Additional filters
    if (status) filter.status = status;
    if (interest) filter.interest = interest;

    const [total, consultations] = await Promise.all([
      Consultation.countDocuments(filter),
      Consultation.find(filter)
        .populate("client", "name email phone")
        .populate("consultant", "name email expertise")
        .populate("service", "title category icon")
        .sort({ dateTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      consultations,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get single consultation
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultationById = async (req: Request, res: Response) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate("client", "name email phone address")
      .populate("consultant", "name email expertise")
      .populate("service", "title category description");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    const user = (req as any).user;
    const isOwnerClient =
      consultation.client._id.toString() === user._id.toString();
    const isAssignedConsultant =
      consultation.consultant?._id?.toString() === user._id.toString();
    const isElevated = [
      "admin",
      "ops_manager",
      "rental_specialist",
      "support_agent",
    ].includes(user.role);

    if (!isElevated && !isOwnerClient && !isAssignedConsultant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Update consultation status, notes, or consultant
// @route   PATCH /api/consultations/:id
// @access  Private (admin, consultant)
export const updateConsultation = async (req: Request, res: Response) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    const user = (req as any).user;
    const isElevated = ["admin", "ops_manager"].includes(user.role);
    const isAssignedConsultant =
      consultation.consultant?.toString() === user._id.toString();
    if (!isElevated && !isAssignedConsultant) {
      return res.status(403).json({ message: "Not authorized to update this consultation" });
    }

    // Update fields
    if (req.body.status) {
      const allowedStatuses = ["scheduled", "completed", "cancelled", "approved", "rejected"];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
        });
      }
      // Approve/reject booking decisions are admin/ops only
      if (
        ["approved", "rejected"].includes(req.body.status) &&
        !isElevated
      ) {
        return res.status(403).json({
          message: "Only admins or operations managers can approve or reject consultations",
        });
      }
      consultation.status = req.body.status;
    }

    if (req.body.notes !== undefined) consultation.notes = req.body.notes;
    // Only elevated staff may reassign consultants
    if (req.body.consultant !== undefined) {
      if (!isElevated) {
        return res.status(403).json({
          message: "Only admins or operations managers can reassign consultants",
        });
      }
      consultation.consultant = req.body.consultant || null;
    }
    if (req.body.dateTime) {
      const newDate = new Date(req.body.dateTime);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ message: "Invalid date/time format" });
      }
      consultation.dateTime = newDate;
    }
    if (req.body.duration) consultation.duration = req.body.duration;
    if (req.body.interest !== undefined) consultation.interest = req.body.interest;

    const updated = await consultation.save();

    // Log audit
    if (user) {
      await logAudit({
        userId: user._id.toString(),
        action: "Updated Consultation",
        details: `Consultation ${updated._id} - Status: ${updated.status}`,
        req,
      });
    }

    const populated = await Consultation.findById(updated._id)
      .populate("client", "name email")
      .populate("consultant", "name email")
      .populate("service", "title");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Cancel consultation
// @route   DELETE /api/consultations/:id
// @access  Private
export const cancelConsultation = async (req: Request, res: Response) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Only the client themselves, admin, or ops can cancel
    const user = (req as any).user;
    if (
      !["admin", "ops_manager"].includes(user.role) &&
      consultation.client.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to cancel this consultation" });
    }

    consultation.status = "cancelled";
    await consultation.save();

    // Log audit
    if (user) {
      await logAudit({
        userId: user._id.toString(),
        action: "Cancelled Consultation",
        details: `Consultation ${consultation._id} cancelled`,
        req,
      });
    }

    res.json({ message: "Consultation cancelled", consultation });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get consultation stats
// @route   GET /api/consultations/stats
// @access  Private/Admin
export const getConsultationStats = async (req: Request, res: Response) => {
  try {
    const totalConsultations = await Consultation.countDocuments();
    const scheduledConsultations = await Consultation.countDocuments({ status: "scheduled" });
    const completedConsultations = await Consultation.countDocuments({ status: "completed" });
    const cancelledConsultations = await Consultation.countDocuments({ status: "cancelled" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayConsultations = await Consultation.countDocuments({
      dateTime: { $gte: today },
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthlyConsultations = await Consultation.countDocuments({
      dateTime: { $gte: thisMonth },
    });

    res.json({
      totalConsultations,
      scheduledConsultations,
      completedConsultations,
      cancelledConsultations,
      todayConsultations,
      monthlyConsultations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};