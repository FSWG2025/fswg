import { type Request, type Response } from "express";
import type { UserRole } from "../../constants/roles";
import { adminStats } from "./stats/adminStats";
import { consultantStats } from "./stats/consultantStats";
import { clientStats } from "./stats/clientStats";
import { supportStats } from "./stats/supportStats";
import { contentEditorStats } from "./stats/contentEditorStats";
import { opsStats } from "./stats/opsStats";
import { networkStats } from "./stats/networkStats";
import { rentalStaffStats } from "./stats/rentalStaffStats";
import { partnerStats } from "./stats/partnerStats";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = user.role as UserRole;
    let stats: any = {};

    switch (role) {
      case "admin":
      case "super_admin":
        stats = await adminStats();
        break;
      case "consultant":
        stats = await consultantStats(user._id);
        break;
      case "client":
        stats = await clientStats(user._id);
        break;
      case "support_agent":
        stats = await supportStats(user._id);
        break;
      case "content_editor":
        stats = await contentEditorStats();
        break;
      case "ops_manager":
        stats = await opsStats();
        break;
      case "network_manager":
        stats = await networkStats();
        break;
      case "mentor":
        stats = await networkStats(user._id, true);
        break;
      case "advisor_trainee":
        stats = {
          ...(await networkStats(user._id, false)),
          ...(await clientStats(user._id)),
        };
        break;
      case "rental_specialist":
      case "underwriter":
        stats = await rentalStaffStats();
        break;
      case "landlord_partner":
      case "referral_partner":
        stats = await partnerStats(user._id, role);
        break;
      default:
        stats = {};
    }

    stats.role = role;
    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
