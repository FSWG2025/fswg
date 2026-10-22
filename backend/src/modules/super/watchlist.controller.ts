import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import Watchlist from "../../models/Watchlist";
import { logAudit } from "../../utils/logAudit";

export const listWatchlist = async (_req: AuthRequest, res: Response) => {
  try {
    const items = await Watchlist.find({ active: true })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const addWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const kind = String(req.body?.kind || "");
    const value = String(req.body?.value || "")
      .trim()
      .toLowerCase();
    if (!["ip", "email", "visitorId", "userId"].includes(kind) || !value) {
      return res.status(400).json({ message: "kind and value required" });
    }

    const item = await Watchlist.findOneAndUpdate(
      { kind, value },
      {
        $set: {
          kind,
          value,
          label: String(req.body?.label || "").slice(0, 120),
          notes: String(req.body?.notes || "").slice(0, 500),
          alertOnReturn: req.body?.alertOnReturn !== false,
          createdBy: req.user!._id,
          active: true,
        },
      },
      { upsert: true, new: true },
    );

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Watchlist add",
      details: `Watch ${kind}=${value}`,
      resourceType: "watchlist",
      resourceId: item._id.toString(),
      req,
      res,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const removeWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Watchlist.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true },
    );
    if (!item) return res.status(404).json({ message: "Not found" });
    await logAudit({
      userId: req.user!._id.toString(),
      action: "Watchlist remove",
      details: `Removed watch ${item.kind}=${item.value}`,
      resourceType: "watchlist",
      resourceId: item._id.toString(),
      req,
      res,
    });
    res.json({ message: "Removed", item });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};
