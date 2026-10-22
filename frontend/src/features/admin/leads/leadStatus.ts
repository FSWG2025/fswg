export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "closed",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function leadStatusClass(status: string): string {
  switch (status) {
    case "new":
      return "bg-[#EFF6FF] text-[#2563EB]";
    case "contacted":
      return "bg-[#F5F3FF] text-[#7C3AED]";
    case "qualified":
      return "bg-[#FFFBEB] text-[#D97706]";
    case "converted":
      return "bg-[#ECFDF5] text-[#059669]";
    case "closed":
      return "bg-[#F3F4F6] text-[#6B7280]";
    default:
      return "bg-[#F3F4F6] text-[#6B7280]";
  }
}

export function leadInitials(first?: string, last?: string): string {
  return `${(first || "?")[0] || ""}${(last || "")[0] || ""}`.toUpperCase();
}

export function formatInterest(interest?: string): string {
  return String(interest || "-").replace(/_/g, " ");
}
