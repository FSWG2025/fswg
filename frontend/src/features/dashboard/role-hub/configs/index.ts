import type { UserRole } from "@/lib/roles";
import { ROLE_LABELS } from "@/lib/roles";
import type { RoleHubConfig } from "./types";
import { consultantConfig } from "./consultant";
import { support_agentConfig } from "./support_agent";
import { content_editorConfig } from "./content_editor";
import { ops_managerConfig } from "./ops_manager";
import { network_managerConfig } from "./network_manager";
import { mentorConfig } from "./mentor";
import { advisor_traineeConfig } from "./advisor_trainee";
import { rental_specialistConfig } from "./rental_specialist";
import { underwriterConfig } from "./underwriter";
import { landlord_partnerConfig } from "./landlord_partner";
import { referral_partnerConfig } from "./referral_partner";

export type {
  RoleHubConfig,
  SnapshotCard,
  JourneyStep,
  ChecklistItem,
  QuickActionTab,
  FeatureModule,
} from "./types";

export const ROLE_HUB_CONFIGS: Partial<Record<UserRole, RoleHubConfig>> = {
  consultant: consultantConfig,
  support_agent: support_agentConfig,
  content_editor: content_editorConfig,
  ops_manager: ops_managerConfig,
  network_manager: network_managerConfig,
  mentor: mentorConfig,
  advisor_trainee: advisor_traineeConfig,
  rental_specialist: rental_specialistConfig,
  underwriter: underwriterConfig,
  landlord_partner: landlord_partnerConfig,
  referral_partner: referral_partnerConfig,
};

export function getRoleHubConfig(role: UserRole): RoleHubConfig | null {
  return ROLE_HUB_CONFIGS[role] || null;
}

export function roleHubTitle(role: UserRole) {
  return ROLE_LABELS[role];
}
