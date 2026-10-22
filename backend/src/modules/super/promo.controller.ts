import { type Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import PromoConfig from "../../models/PromoConfig";
import { logAudit } from "../../utils/logAudit";

export const listPromos = async (_req: AuthRequest, res: Response) => {
  try {
    const promos = await PromoConfig.find().sort({ updatedAt: -1 }).lean();
    res.json({ promos });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const upsertPromo = async (req: AuthRequest, res: Response) => {
  try {
    const key = String(req.body?.key || "")
      .trim()
      .slice(0, 80);
    if (!key) return res.status(400).json({ message: "key required" });

    const promo = await PromoConfig.findOneAndUpdate(
      { key },
      {
        $set: {
          key,
          title: String(req.body?.title || "Promo").slice(0, 160),
          body: String(req.body?.body || "").slice(0, 600),
          ctaLabel: req.body?.ctaLabel
            ? String(req.body.ctaLabel).slice(0, 60)
            : undefined,
          ctaHref: req.body?.ctaHref
            ? String(req.body.ctaHref).slice(0, 300)
            : undefined,
          audience: ["anon", "logged_in", "all"].includes(req.body?.audience)
            ? req.body.audience
            : "all",
          pageTargets: Array.isArray(req.body?.pageTargets)
            ? req.body.pageTargets.map(String).slice(0, 40)
            : ["*"],
          startsAt: req.body?.startsAt ? new Date(req.body.startsAt) : null,
          endsAt: req.body?.endsAt ? new Date(req.body.endsAt) : null,
          active: req.body?.active !== false,
          killed: false,
          updatedBy: req.user!._id,
        },
      },
      { upsert: true, new: true },
    );

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Promo upsert",
      details: `Promo ${key}`,
      resourceType: "promo",
      resourceId: promo._id.toString(),
      req,
      res,
    });

    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const killPromo = async (req: AuthRequest, res: Response) => {
  try {
    const promo = await PromoConfig.findByIdAndUpdate(
      req.params.id,
      { killed: true, active: false, updatedBy: req.user!._id },
      { new: true },
    );
    if (!promo) return res.status(404).json({ message: "Not found" });

    await logAudit({
      userId: req.user!._id.toString(),
      action: "Kill promo",
      details: `Killed promo ${promo.key}`,
      resourceType: "promo",
      resourceId: promo._id.toString(),
      req,
      res,
    });

    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

export const killAllPromos = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PromoConfig.updateMany(
      { killed: false },
      { killed: true, active: false, updatedBy: req.user!._id },
    );
    await logAudit({
      userId: req.user!._id.toString(),
      action: "Kill all promos",
      details: `Killed ${result.modifiedCount} promos`,
      resourceType: "promo",
      resourceId: "all",
      req,
      res,
    });
    res.json({ killed: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: String(error) });
  }
};

/** Public active promos for site surfaces */
export const publicPromos = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const loggedIn = Boolean(req.user);
    const path = String(req.query.path || "*");
    const promos = await PromoConfig.find({
      active: true,
      killed: false,
      $and: [
        {
          $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
        },
        {
          $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
        },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    const filtered = promos.filter((p) => {
      if (p.audience === "anon" && loggedIn) return false;
      if (p.audience === "logged_in" && !loggedIn) return false;
      if (
        p.pageTargets?.length &&
        !p.pageTargets.includes("*") &&
        !p.pageTargets.some((t) => path === t || path.startsWith(t))
      ) {
        return false;
      }
      return true;
    });

    res.json({ promos: filtered });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
