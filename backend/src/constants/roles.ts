/**
 * Canonical user roles for First Step Wealth Group.
 * Keep in sync with frontend/src/lib/roles.ts
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

/** God-mode only */
export const SUPER_ADMIN_ROLES: UserRole[] = ["super_admin"];

/** Platform admins (normal admin + super). Super inherits all admin permissions. */
export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/** Can manage leads / clients / consultations */
export const CRM_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "rental_specialist",
];

/** Can review & update rental applications (notes, info request, under review) */
export const RENTAL_STAFF_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "rental_specialist",
  "underwriter",
  "ops_manager",
];

/** Final approve / reject on rental applications — admin tier */
export const RENTAL_APPROVE_ROLES: UserRole[] = ["admin", "super_admin"];

/** Can delete rental applications */
export const RENTAL_DELETE_ROLES: UserRole[] = [
  "admin",
  "super_admin",
  "underwriter",
];

/** Final approve / reject / enroll advisor applications — admin tier */
export const ADVISOR_APPROVE_ROLES: UserRole[] = ["admin", "super_admin"];

/** Can open the approval queue (staff submit; admin decides) */
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

/** Lead CRUD + convert */
export const LEAD_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "rental_specialist",
];

/** Bulk assign leads */
export const LEAD_BULK_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
];

/** User directory (list/update clients) */
export const USER_MANAGE_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "consultant",
  "ops_manager",
  "support_agent",
];

/** Hard delete / export users */
export const USER_ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];

/** CMS content */
export const CONTENT_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "content_editor",
];

/** Services catalog */
export const SERVICE_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
];

/** Audit logs */
export const AUDIT_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
];

/** Advisor network applications */
export const NETWORK_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "network_manager",
  "mentor",
];

/** Funnel analytics */
export const FUNNEL_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "ops_manager",
  "network_manager",
];

/** Bookings visible */
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

/** Staff-like (not client, not external partner) */
export const INTERNAL_ROLES: UserRole[] = [
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

export const PARTNER_ROLES: UserRole[] = [
  "landlord_partner",
  "referral_partner",
];

export const isUserRole = (value: string): value is UserRole =>
  (USER_ROLES as readonly string[]).includes(value);

export const hasRole = (userRole: string | undefined, allowed: UserRole[]) =>
  !!userRole && allowed.includes(userRole as UserRole);

export const isSuperAdmin = (role: string | undefined | null) =>
  role === "super_admin";

export const isPlatformAdmin = (role: string | undefined | null) =>
  role === "admin" || role === "super_admin";

/** Roles that normal admins must not suspend / demote without super */
export const PROTECTED_ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];
