import type { RoleHubConfig } from "./types";
import { ClipboardCheck, FileText, Home, Shield } from "lucide-react";

export const underwriterConfig: RoleHubConfig = {
    role: "underwriter",
    subtitle:
      "Guarantor risk desk: approve, condition, or decline rental guarantees with audit-grade notes.",
    primaryCta: {
      label: "Underwriting queue",
      href: "/admin/rental-applications",
    },
    snapshots: [
      {
        key: "review",
        label: "In review",
        statKey: "underReview",
        sub: "Risk decisions",
        icon: Shield,
        href: "/admin/rental-applications",
        accent: true,
      },
      {
        key: "submitted",
        label: "Submitted",
        statKey: "pendingApplications",
        sub: "Incoming",
        icon: FileText,
        href: "/admin/rental-applications",
      },
      {
        key: "approved",
        label: "Approved",
        statKey: "approved",
        sub: "Guarantees path",
        icon: Home,
        href: "/admin/rental-applications",
      },
      {
        key: "rejected",
        label: "Declined",
        statKey: "rejected",
        sub: "With reasons",
        icon: ClipboardCheck,
        href: "/admin/rental-applications",
      },
    ],
    quickActions: [
      {
        id: "decide",
        label: "Decide",
        title: "Make risk decisions",
        body: "Approve, request conditions, or decline with reason codes.",
        cta: "Open queue",
        href: "/admin/rental-applications",
      },
      {
        id: "audit",
        label: "Audit",
        title: "Review decision trail",
        body: "Ops can spot-check; keep notes complete.",
        cta: "Open applications",
        href: "/admin/rental-applications",
      },
    ],
    journey: [
      {
        id: "receive",
        label: "Receive file",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.underReview || 0) > 0,
      },
      {
        id: "verify",
        label: "Verify risk",
        href: "/admin/rental-applications",
        doneWhen: () => false,
      },
      {
        id: "decide",
        label: "Decide",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.approved || 0) + (s.rejected || 0) > 0,
      },
      {
        id: "document",
        label: "Document",
        href: "/admin/rental-applications",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-chart",
        eyebrow: "Feature 01 · Book",
        title: "Portfolio status mix",
        body: "Approved vs declined vs in-flight.",
        type: "chart",
        chartStatKey: "applicationStatuses",
      },
      {
        id: "dash-uw",
        eyebrow: "Feature 02 · Underwriting",
        title: "Decision checklist",
        body: "Never approve without a written rationale.",
        type: "checklist",
        checklistStorageKey: "fswg:uw:decision",
        checklist: [
          { id: "income", label: "Income supports rent + buffer" },
          { id: "id", label: "Identity documents verified" },
          { id: "history", label: "Prior lease / references reviewed" },
          { id: "exposure", label: "Portfolio exposure acceptable" },
          { id: "reason", label: "Reason code + internal note saved" },
          { id: "notify", label: "Specialist notified to message client" },
        ],
      },
      {
        id: "dash-rules",
        eyebrow: "Feature 03 · Authority",
        title: "Underwriter authority",
        body: "What this role is trusted to do.",
        type: "info",
        infoLines: [
          "Can update rental application status and internal notes.",
          "Can delete applications when policy requires (with audit).",
          "Cannot edit CMS, export all users, or bulk-assign leads.",
        ],
      },
    ],
    resources: [
      {
        title: "Rental applications",
        href: "/admin/rental-applications",
        blurb: "Decision queue.",
      },
    ],
  };
