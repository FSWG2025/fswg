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

export const contentEditorStats = async () => {
  const published = await Content.countDocuments({ published: true });
  const drafts = await Content.countDocuments({ published: false });
  const blogs = await Content.countDocuments({ contentType: "blog" });
  const testimonials = await Content.countDocuments({
    contentType: "testimonial",
  });
  const pages = await Content.countDocuments({ contentType: "page" });

  return {
    published,
    drafts,
    blogs,
    testimonials,
    pages,
    totalContent: published + drafts,
  };
};
