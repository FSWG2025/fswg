import type { Response } from "express";
import Message from '../../models/Message';
import User from '../../models/User';
import type { AuthRequest } from '../../middleware/auth';

const STAFF_INBOX_ROLES = new Set([
  "admin",
  "consultant",
  "support_agent",
  "ops_manager",
  "mentor",
  "rental_specialist",
  "network_manager",
]);

const resolveAdvisorId = async (user: any): Promise<string | null> => {
  if (user.assignedConsultant) {
    return String(user.assignedConsultant._id || user.assignedConsultant);
  }
  const support = await User.findOne({
    role: { $in: ["support_agent", "admin"] },
    isActive: true,
  })
    .select("_id")
    .lean();
  return support ? String(support._id) : null;
};

// @desc    List messages for current user (inbox thread with advisor/support)
// @route   GET /api/messages
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    const isStaffInbox = STAFF_INBOX_ROLES.has(me.role);
    const advisorId = isStaffInbox ? null : await resolveAdvisorId(me);

    // Staff see all threads they're part of; clients see peer thread
    const filter = isStaffInbox
      ? { $or: [{ sender: me._id }, { recipient: me._id }] }
      : advisorId
        ? {
            $or: [
              { sender: me._id, recipient: advisorId },
              { sender: advisorId, recipient: me._id },
            ],
          }
        : { $or: [{ sender: me._id }, { recipient: me._id }] };

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .populate("recipient", "name role")
      .limit(200)
      .lean();

    const unreadCount = await Message.countDocuments({
      recipient: me._id,
      read: false,
    });

    res.json({
      messages,
      unreadCount,
      peer: advisorId
        ? await User.findById(advisorId).select("name email role expertise").lean()
        : null,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to load messages" });
  }
};

// @desc    Send a message to assigned advisor / support
// @route   POST /api/messages
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!;
    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ message: "Message body is required" });

    let recipientId = req.body.recipientId as string | undefined;
    const isStaff = STAFF_INBOX_ROLES.has(me.role);

    if (!isStaff) {
      // Clients may only message their assigned advisor / fallback support — ignore arbitrary IDs
      recipientId = (await resolveAdvisorId(me)) || undefined;
    } else if (recipientId) {
      const peer = await User.findById(recipientId).select("role isActive").lean();
      if (!peer || !peer.isActive) {
        return res.status(400).json({ message: "Recipient not found" });
      }
      // Never expose or message super_admins from the normal inbox
      if (peer.role === "super_admin" && me.role !== "super_admin") {
        return res.status(404).json({ message: "Recipient not found" });
      }
      // Staff should not DM other staff as a substitute for internal tools
      if (STAFF_INBOX_ROLES.has(peer.role) && peer.role !== "client") {
        // Allow staff→staff only for support/admin triage
        if (!["admin", "support_agent", "ops_manager"].includes(me.role)) {
          return res.status(403).json({
            message: "You can only message clients from this inbox",
          });
        }
      }
    } else {
      return res.status(400).json({ message: "recipientId is required for staff" });
    }

    if (!recipientId) {
      return res.status(400).json({
        message: "No advisor or support contact is available yet. Book a consultation first.",
      });
    }

    const message = await Message.create({
      sender: me._id,
      recipient: recipientId,
      body: body.slice(0, 4000),
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name role")
      .populate("recipient", "name role");

    // Strip super_admin role labels from non-super viewers
    if (me.role !== "super_admin" && populated) {
      const scrub = (u: any) => {
        if (u && typeof u === "object" && u.role === "super_admin") {
          u.role = "admin";
          u.name = "Support";
          u.email = undefined;
        }
      };
      scrub((populated as any).sender);
      scrub((populated as any).recipient);
    }

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to send message" });
  }
};

// @desc    Mark received messages as read
// @route   PATCH /api/messages/read
export const markMessagesRead = async (req: AuthRequest, res: Response) => {
  try {
    await Message.updateMany(
      { recipient: req.user!._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Messages marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to update messages" });
  }
};
