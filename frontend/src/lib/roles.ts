/**
 * Canonical user roles: keep in sync with backend/src/constants/roles.ts
 */
export const USER_ROLES = [
  "super_admin",
  "admin",
  "consultant",
  "client",
  "support_agent",
  "content_editor",
  "ops_manager",
  "network_manager",
  "mentor",
  "advisor_trainee",
  "rental_specialist",
  "underwriter",
  "landlord_partner",
  "referral_partner",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  consultant: "Consultant",
  client: "Client",
  support_agent: "Support Agent",
  content_editor: "Content Editor",
  ops_manager: "Operations Manager",
  network_manager: "Network Manager",
  mentor: "Mentor",
  advisor_trainee: "Advisor Trainee",
  rental_specialist: "Rental Specialist",
  underwriter: "Underwriter",
  landlord_partner: "Landlord Partner",
  referral_partner: "Referral Partner",
};

export const SUPER_ADMIN_ROLES: UserRole[] = ["super_admin"];

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/** Roles an admin can assign when creating/editing users (not super_admin) */
export const ASSIGNABLE_ROLES: UserRole[] = USER_ROLES.filter(
  (r) => r !== "super_admin",
);

/** Super may also assign super_admin (with break-glass) */
export const SUPER_ASSIGNABLE_ROLES: UserRole[] = [...USER_ROLES];

export const CRM_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "rental_specialist",
];

export const RENTAL_STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "rental_specialist",
  "underwriter",
  "ops_manager",
];

/** Final approve / reject on rental & advisor applications */
export const APPROVE_APPLICATION_ROLES: UserRole[] = ["admin", "super_admin"];

/** Can submit or review critical-action approval requests */
export const APPROVAL_QUEUE_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "rental_specialist",
  "underwriter",
  "network_manager",
  "mentor",
  "support_agent",
];

export const CONTENT_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "content_editor",
];

export const NETWORK_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "network_manager",
  "mentor",
];

export const FUNNEL_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
  "network_manager",
];

export const AUDIT_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
];

export const BOOKING_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "client",
  "ops_manager",
  "rental_specialist",
  "support_agent",
  "mentor",
  "advisor_trainee",
];

export const USER_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "support_agent",
];

export const PARTNER_ROLES: UserRole[] = [
  "landlord_partner",
  "referral_partner",
];

export const INTERNAL_STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "support_agent",
  "content_editor",
  "ops_manager",
  "network_manager",
  "mentor",
  "advisor_trainee",
  "rental_specialist",
  "underwriter",
];

/** Roles that get the polished RoleHub dashboard (not client, not legacy admin-only shell alone) */
export const ROLE_HUB_ROLES: UserRole[] = [
  "consultant",
  "support_agent",
  "content_editor",
  "ops_manager",
  "network_manager",
  "mentor",
  "advisor_trainee",
  "rental_specialist",
  "underwriter",
  "landlord_partner",
  "referral_partner",
];

export const isUserRole = (value: string): value is UserRole =>
  (USER_ROLES as readonly string[]).includes(value);

export const hasRole = (
  userRole: string | undefined | null,
  allowed: readonly UserRole[],
) => !!userRole && allowed.includes(userRole as UserRole);

export const isSuperAdmin = (role: string | undefined | null) =>
  role === "super_admin";

export const isPlatformAdmin = (role: string | undefined | null) =>
  role === "admin" || role === "super_admin";

export const roleLabel = (role: string | undefined | null) =>
  role && isUserRole(role) ? ROLE_LABELS[role] : role || "User";
