import { type Request, type Response } from "express";
import Lead from '../../models/Lead';
import User from '../../models/User';
import { logAudit, logSystemAudit } from '../../utils/logAudit';
import crypto from "crypto";

// @desc    Create a new Lead (from contact form / public)
// @route   POST /api/leads
// @access  Public (or Private)
export const createLead = async (req: Request, res: Response) => {
  try {
    const { isFeatureEnabled } = await import("../../middleware/maintenanceGate");
    const leadCaptureOn = await isFeatureEnabled("leadCapture");
    if (!leadCaptureOn) {
      return res.status(503).json({
        message: "Lead capture is temporarily unavailable.",
        code: "FEATURE_DISABLED",
      });
    }

    const { firstName, lastName, email, phone, source, interest, notes } = req.body;

    // Basic validation
    if (!firstName || !email) {
      return res.status(400).json({ message: "First name and email are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check for duplicate recent lead (within 24 hours)
    const recentLead = await Lead.findOne({
      email,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (recentLead) {
      return res.status(400).json({
        message: "A lead with this email was recently submitted. Please wait 24 hours.",
      });
    }

    const lead = await Lead.create({
      firstName,
      lastName: lastName || "",
      email,
      phone: phone || "",
      source: source || "website",
      interest: interest || "Consultation",
      notes: notes ? [notes] : [],
    });

    if ((req as any).user?._id) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Created Lead",
        details: `Lead ${firstName} ${lastName || ""} (${email})`,
        resourceType: "lead",
        resourceId: lead._id.toString(),
        req,
        res,
      });
    } else {
      await logSystemAudit(
        "Created Lead",
        `Public lead ${firstName} ${lastName || ""} (${email}) via ${source || "website"}`,
        { leadId: lead._id.toString(), interest },
      );
      if ((res as any).locals) (res as any).locals.audited = true;
    }

    res.status(201).json(lead);
  } catch (error) {
    console.error("❌ Lead creation error:", error);
    res.status(500).json({
      message: "Failed to create lead",
      error: (error as Error).message,
    });
  }
};

// @desc    Get all Leads (admin/consultant)
// @route   GET /api/leads
// @access  Private (admin, consultant)
export const getLeads = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const interest = req.query.interest as string;
    const assignedTo = req.query.assignedTo as string;
    const search = req.query.search as string;
    const source = req.query.source as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const filter: any = {};

    // Role-based filtering — consultants cannot override their own scope
    const user = (req as any).user;
    const isConsultant = user.role === "consultant";
    if (isConsultant) {
      filter.assignedConsultant = user._id;
    }

    // Apply filters
    if (status && status !== "all") filter.status = status;
    if (interest) filter.interest = interest;
    if (assignedTo && !isConsultant) filter.assignedConsultant = assignedTo;
    if (source) filter.source = source;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter)
        .populate("assignedConsultant", "name email expertise")
        .populate("convertedClient", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      leads,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private (admin, consultant)
export const getLeadById = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedConsultant", "name email expertise")
      .populate("convertedClient", "name email phone");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const user = (req as any).user;
    if (
      user?.role === "consultant" &&
      String(lead.assignedConsultant?._id || lead.assignedConsultant || "") !==
        String(user._id)
    ) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update Lead (assign, change status, add notes)
// @route   PATCH /api/leads/:id
// @access  Private (admin, consultant)
export const updateLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const actor = (req as any).user;
    if (
      actor?.role === "consultant" &&
      String(lead.assignedConsultant || "") !== String(actor._id)
    ) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Consultants cannot reassign leads away from themselves
    if (actor?.role === "consultant" && req.body.assignedConsultant !== undefined) {
      return res.status(403).json({ message: "Consultants cannot reassign leads" });
    }

    const changeLog: string[] = [];
    const who = `${lead.firstName} ${lead.lastName || ""}`.trim();

    // Update status with validation
    if (req.body.status) {
      const allowedStatuses = ["new", "contacted", "qualified", "converted", "closed"];
      if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
        });
      }
      if (lead.status !== req.body.status) {
        changeLog.push(`status ${lead.status} → ${req.body.status}`);
      }
      lead.status = req.body.status;
    }

    // Assign consultant
    if (req.body.assignedConsultant !== undefined) {
      if (req.body.assignedConsultant) {
        const consultant = await User.findById(req.body.assignedConsultant);
        if (!consultant || consultant.role !== "consultant") {
          return res.status(400).json({ message: "Invalid consultant" });
        }
        changeLog.push(`assigned to ${consultant.name} <${consultant.email}>`);
      } else {
        changeLog.push("unassigned consultant");
      }
      lead.assignedConsultant = req.body.assignedConsultant || null;
    }

    // Add or set notes
    if (req.body.notes) {
      if (Array.isArray(req.body.notes)) {
        lead.notes = req.body.notes;
        changeLog.push(`replaced notes (${req.body.notes.length})`);
      } else {
        lead.notes.push(req.body.notes);
        changeLog.push(`added note: "${String(req.body.notes).slice(0, 100)}"`);
      }
    }

    // Update other fields
    if (req.body.interest && req.body.interest !== lead.interest) {
      changeLog.push(`interest ${lead.interest || "—"} → ${req.body.interest}`);
      lead.interest = req.body.interest;
    }
    if (req.body.firstName && req.body.firstName !== lead.firstName) {
      changeLog.push(`firstName → ${req.body.firstName}`);
      lead.firstName = req.body.firstName;
    }
    if (req.body.lastName !== undefined && req.body.lastName !== lead.lastName) {
      changeLog.push(`lastName → ${req.body.lastName || "(cleared)"}`);
      lead.lastName = req.body.lastName;
    }
    if (req.body.email && req.body.email !== lead.email) {
      changeLog.push(`email → ${req.body.email}`);
      lead.email = req.body.email;
    }
    if (req.body.phone !== undefined && req.body.phone !== lead.phone) {
      changeLog.push(`phone → ${req.body.phone || "(cleared)"}`);
      lead.phone = req.body.phone;
    }
    if (req.body.source && req.body.source !== lead.source) {
      changeLog.push(`source → ${req.body.source}`);
      lead.source = req.body.source;
    }

    const updatedLead = await lead.save();

    // Log audit
    if ((req as any).user) {
      await logAudit({
        userId: (req as any).user._id.toString(),
        action: "Updated Lead",
        details:
          changeLog.length > 0
            ? `Lead ${who} <${updatedLead.email}>: ${changeLog.join("; ")}`
            : `Lead ${who} <${updatedLead.email}> saved (no field changes detected)`,
        resourceType: "lead",
        resourceId: String(updatedLead._id),
        req,
        res,
      });
    }

    const populated = await Lead.findById(updatedLead._id)
      .populate("assignedConsultant", "name email")
      .populate("convertedClient", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Delete Lead
// @route   DELETE /api/leads/:id
// @access  Private (admin)
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Deleted Lead",
      details: `Deleted lead ${lead.firstName} ${lead.lastName}`,
      req,
    });

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Convert lead to a client user
// @route   PATCH /api/leads/:id/convert
// @access  Private (admin, consultant)
export const convertLeadToClient = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const actor = (req as any).user;
    if (
      actor?.role === "consultant" &&
      String(lead.assignedConsultant || "") !== String(actor._id)
    ) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (lead.convertedClient) {
      return res.status(400).json({ message: "Lead already converted" });
    }

    const existingUser = await User.findOne({
      email: lead.email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({
        message:
          "A user with this email already exists. Link the lead to that account instead of converting again.",
      });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(12).toString("hex");

    // Create user from lead
    const user = await User.create({
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      email: lead.email.toLowerCase(),
      password: tempPassword,
      role: "client",
      phone: lead.phone || "",
      clientType: "lead",
      assignedConsultant: lead.assignedConsultant || null,
    });

    // Update lead
    lead.convertedClient = user._id;
    lead.status = "converted";
    await lead.save();

    await logAudit({
      userId: (req as any).user._id.toString(),
      action: "Converted Lead to Client",
      details: `Lead ${lead.firstName} ${lead.lastName} converted to client ${user._id}`,
      req,
    });

    // Never return temp passwords in API responses (shows in network logs / XSS surfaces).
    // Password is generated for account creation; deliver via secure channel separately.
    void tempPassword;

    res.json({
      message:
        "Lead converted to client successfully. Share login credentials through a secure channel.",
      client: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Bulk assign leads
// @route   PATCH /api/leads/bulk-assign
// @access  Private/Admin
export const bulkAssignLeads = async (req: Request, res: Response) => {
  try {
    const { leadIds, consultantId } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "leadIds array is required" });
    }

    if (!consultantId) {
      return res.status(400).json({ message: "consultantId is required" });
    }

    // Validate consultant
    const consultant = await User.findById(consultantId);
    if (!consultant || consultant.role !== "consultant") {
      return res.status(400).json({ message: "Invalid consultant" });
    }

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { assignedConsultant: consultantId }
    );

    res.json({
      message: `${result.modifiedCount} leads assigned to ${consultant.name}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};