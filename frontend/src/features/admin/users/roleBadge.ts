import type { UserRole } from "@/lib/roles";

/** Soft warm badges aligned with dashboard snapshot tones. */
export function roleBadgeClass(role: string): string {
  const map: Partial<Record<UserRole, string>> = {
    admin: "bg-[#12213E] text-white border-transparent",
    consultant: "bg-[#FBF4EB] text-[#8A6840] border-[#E8D5BC]",
    client: "bg-[#F3F9E4] text-[#3F6212] border-[#D4E8A8]",
    support_agent: "bg-[#FFF1EB] text-[#9A3412] border-[#F0C9B0]",
    content_editor: "bg-[#FDF2F2] text-[#9F1239] border-[#E8C4C4]",
    ops_manager: "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]",
    network_manager: "bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]",
    mentor: "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]",
    advisor_trainee: "bg-[#FFFBEB] text-[#92400E] border-[#E6D08A]",
    rental_specialist: "bg-[#F0F9FF] text-[#075985] border-[#BAE6FD]",
    underwriter: "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]",
    landlord_partner: "bg-[#FAF6EF] text-[#78716C] border-[#E5D9C5]",
    referral_partner: "bg-[#FFF0F1] text-[#9F1239] border-[#E8B4B8]",
  };
  return (
    map[role as UserRole] ||
    "bg-[#F7FBFE] text-[#12213E] border-[#E5EAF0]"
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}
