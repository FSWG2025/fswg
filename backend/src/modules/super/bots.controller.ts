import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import BotBlock from "../../models/BotBlock";
import SiteVisitor from "../../models/SiteVisitor";
import { logAudit } from "../../utils/logAudit";

export const listBotBlocks = async (req: AuthRequest, res: Response) => {
  try {
    const blocks = await BotBlock.find()
      .sort({ lastSeenAt: -1 })
      .limit(100)
      .lean();
    res.json({ blocks });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const unblockBot = async (req: AuthRequest, res: Response) => {
  try {
    const block = await BotBlock.findByIdAndDelete(req.params.id);
    if (!block) return res.status(404).json({ message: "Not found" });
    if (block.visitorId) {
      await SiteVisitor.updateOne(
        { visitorId: block.visitorId },
        { $set: { blocked: false, botScore: 0 } },
      );
    }
    await logAudit({
      userId: req.user!._id.toString(),
      action: "Unblocked bot",
      details: `Unblocked ${block.ip || block.visitorId}`,
      resourceType: "bot",
      resourceId: String(block._id),
      req,
      res,
    });
    res.json({ message: "Unblocked" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const broadcast = async (req: AuthRequest, res: Response) => {
  try {
    const { getSystemSettings } = await import("../../models/SystemSettings");
    const settings = await getSystemSettings();
    settings.broadcastBanner = String(req.body?.message || "").slice(0, 400);
    settings.broadcastBannerUntil = req.body?.until
      ? new Date(req.body.until)
      : new Date(Date.now() + 4 * 3600_000);
    settings.updatedBy = req.user!._id as any;
    await settings.save();

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Broadcast banner",
      details: settings.broadcastBanner,
      resourceType: "system",
      resourceId: "broadcast",
      metadata: {
        roles: req.body?.roles || ["all"],
        // Stub: email/SMS hooks log only in dev
        notifyChannels: req.body?.channels || ["banner"],
      },
      req,
      res,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[broadcast stub]",
        settings.broadcastBanner,
        req.body?.roles,
        req.body?.channels,
      );
    }

    res.json({
      message: "Broadcast set",
      banner: settings.broadcastBanner,
      until: settings.broadcastBannerUntil,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
