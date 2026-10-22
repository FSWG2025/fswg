import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/lib/roles";

export type SnapshotCard = {
  key: string;
  label: string;
  statKey: string;
  sub: string;
  icon: LucideIcon;
  href?: string;
  accent?: boolean;
  format?: "number" | "percent" | "text";
};

export type JourneyStep = {
  id: string;
  label: string;
  href: string;
  doneWhen: (stats: Record<string, any>) => boolean;
};

export type ChecklistItem = {
  id: string;
  label: string;
};

export type QuickActionTab = {
  id: string;
  label: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  action?: "book";
};

export type FeatureModule = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  type: "journey" | "checklist" | "links" | "chart" | "info" | "progress";
  checklist?: ChecklistItem[];
  checklistStorageKey?: string;
  links?: { title: string; href: string; blurb: string }[];
  chartStatKey?: string;
  progressStatKey?: string;
  infoLines?: string[];
};

export type RoleHubConfig = {
  role: UserRole;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  snapshots: SnapshotCard[];
  quickActions: QuickActionTab[];
  journey: JourneyStep[];
  features: FeatureModule[];
  resources: { title: string; href: string; blurb: string }[];
  searchExtras?: {
    id: string;
    title: string;
    blurb: string;
    category: string;
    keywords: string[];
    href?: string;
    sectionId?: string;
  }[];
};
