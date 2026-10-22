import type { RoleHubConfig } from "./types";
import { FileText, Target, TrendingUp, Users } from "lucide-react";

export const ops_managerConfig: RoleHubConfig = {
    role: "ops_manager",
    subtitle:
      "Operations cockpit: funnel health, capacity, SLAs, and bulk assignment.",
    primaryCta: { label: "Open funnel", href: "/admin/funnel" },
    snapshots: [
      {
        key: "leads",
        label: "New leads",
        statKey: "newLeads",
        sub: "Need owners",
        icon: Target,
        href: "/admin/leads/new",
        accent: true,
      },
      {
        key: "conv",
        label: "Conversion",
        statKey: "conversionRate",
        sub: "Lead → client",
        icon: TrendingUp,
        href: "/admin/funnel",
        format: "percent",
      },
      {
        key: "apps",
        label: "Pending apps",
        statKey: "pendingApplications",
        sub: "Rental SLA",
        icon: FileText,
        href: "/admin/rental-applications",
      },
      {
        key: "unassigned",
        label: "Unassigned",
        statKey: "unassignedLeads",
        sub: "Need bulk assign",
        icon: Users,
        href: "/admin/leads",
      },
      {
        key: "advisors",
        label: "Advisors",
        statKey: "activeConsultants",
        sub: "Active capacity",
        icon: Users,
        href: "/admin/clients",
      },
    ],
    quickActions: [
      {
        id: "funnel",
        label: "Funnel",
        title: "Inspect conversion",
        body: "Sources, interests, and consultant performance.",
        cta: "Open funnel",
        href: "/admin/funnel",
      },
      {
        id: "assign",
        label: "Assign",
        title: "Balance lead load",
        body: "Bulk-assign unassigned leads to consultants.",
        cta: "Open leads",
        href: "/admin/leads",
      },
      {
        id: "rentals",
        label: "Rentals",
        title: "Clear application SLA",
        body: "Escalate aging submitted applications.",
        cta: "Review apps",
        href: "/admin/rental-applications",
      },
    ],
    journey: [
      {
        id: "assign",
        label: "Assign leads",
        href: "/admin/leads",
        doneWhen: (s) => (s.unassignedLeads || 0) === 0,
      },
      {
        id: "sla",
        label: "Clear rental SLA",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.pendingApplications || 0) === 0,
      },
      {
        id: "funnel",
        label: "Review funnel",
        href: "/admin/funnel",
        doneWhen: () => false,
      },
      {
        id: "audit",
        label: "Spot-check audit",
        href: "/admin/audit-logs",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-sla",
        eyebrow: "Feature 01 · SLA",
        title: "Daily ops checklist",
        body: "Keep the machine moving without needing super-admin powers.",
        type: "checklist",
        checklistStorageKey: "fswg:ops:daily",
        checklist: [
          { id: "unassigned", label: "Zero unassigned new leads" },
          { id: "aging", label: "No rental apps stuck > 48h in submitted" },
          { id: "capacity", label: "Check consultant load balance" },
          { id: "network", label: "Glance at advisor applicants pending" },
          { id: "report", label: "Note blockers for leadership" },
        ],
      },
      {
        id: "dash-links",
        eyebrow: "Feature 02 · Control room",
        title: "Ops destinations",
        body: "Funnel, people, rentals, and audit.",
        type: "links",
        links: [
          {
            title: "Funnel analytics",
            href: "/admin/funnel",
            blurb: "Conversion and performance.",
          },
          {
            title: "Leads",
            href: "/admin/leads",
            blurb: "Assign and qualify.",
          },
          {
            title: "Audit logs",
            href: "/admin/audit-logs",
            blurb: "Who changed what.",
          },
          {
            title: "Services",
            href: "/admin/services",
            blurb: "Catalog health.",
          },
        ],
      },
    ],
    resources: [
      {
        title: "Funnel",
        href: "/admin/funnel",
        blurb: "Analytics.",
      },
      {
        title: "Leads",
        href: "/admin/leads",
        blurb: "CRM.",
      },
      {
        title: "Clients",
        href: "/admin/clients",
        blurb: "Directory.",
      },
      {
        title: "Rentals",
        href: "/admin/rental-applications",
        blurb: "Application queue.",
      },
      {
        title: "Audit",
        href: "/admin/audit-logs",
        blurb: "Compliance trail.",
      },
    ],
  };
