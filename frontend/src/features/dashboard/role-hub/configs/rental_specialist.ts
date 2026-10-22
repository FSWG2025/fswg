import type { RoleHubConfig } from "./types";
import { sharedBookingsResources } from "./shared";
import { ClipboardCheck, FileText, Home, MessageSquare } from "lucide-react";

export const rental_specialistConfig: RoleHubConfig = {
    role: "rental_specialist",
    subtitle:
      "Rental guarantee war room: applications, docs, landlord matches, and client readiness.",
    primaryCta: {
      label: "Review applications",
      href: "/admin/rental-applications",
    },
    snapshots: [
      {
        key: "submitted",
        label: "Submitted",
        statKey: "pendingApplications",
        sub: "New queue",
        icon: FileText,
        href: "/admin/rental-applications",
        accent: true,
      },
      {
        key: "review",
        label: "In review",
        statKey: "underReview",
        sub: "Working",
        icon: ClipboardCheck,
        href: "/admin/rental-applications",
      },
      {
        key: "info",
        label: "Info requested",
        statKey: "infoRequested",
        sub: "Waiting on client",
        icon: MessageSquare,
        href: "/admin/rental-applications",
      },
      {
        key: "approved",
        label: "Approved",
        statKey: "approved",
        sub: "Ready for guarantee",
        icon: Home,
        href: "/admin/rental-applications",
      },
    ],
    quickActions: [
      {
        id: "queue",
        label: "Queue",
        title: "Clear submitted apps",
        body: "Move new applications into review with notes.",
        cta: "Open queue",
        href: "/admin/rental-applications",
      },
      {
        id: "info",
        label: "Request info",
        title: "Chase missing docs",
        body: "Use request-info templates and message clients.",
        cta: "Open applications",
        href: "/admin/rental-applications",
      },
      {
        id: "leads",
        label: "Leads",
        title: "Housing-intent leads",
        body: "Qualify rental_applicant interest leads.",
        cta: "Open leads",
        href: "/admin/leads",
      },
    ],
    journey: [
      {
        id: "intake",
        label: "Intake",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.pendingApplications || 0) === 0,
      },
      {
        id: "docs",
        label: "Verify docs",
        href: "/admin/rental-applications",
        doneWhen: () => false,
      },
      {
        id: "decide",
        label: "Advance status",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.approved || 0) > 0,
      },
      {
        id: "landlord",
        label: "Landlord match",
        href: "/admin/rental-applications",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-chart",
        eyebrow: "Feature 01 · Queue health",
        title: "Application status mix",
        body: "Where every rental application sits right now.",
        type: "chart",
        chartStatKey: "applicationStatuses",
      },
      {
        id: "dash-review",
        eyebrow: "Feature 02 · Review ritual",
        title: "Per-application checklist",
        body: "Same bar for every newcomer file.",
        type: "checklist",
        checklistStorageKey: "fswg:rental:review",
        checklist: [
          { id: "id", label: "Government ID present in vault" },
          { id: "income", label: "Income / employment evidence" },
          { id: "refs", label: "References contacted or noted" },
          { id: "budget", label: "Rent budget vs city realistic" },
          { id: "notes", label: "Internal note written" },
          { id: "client", label: "Client notified of next step" },
        ],
      },
    ],
    resources: [
      {
        title: "Rental applications",
        href: "/admin/rental-applications",
        blurb: "Full queue.",
      },
      {
        title: "Leads",
        href: "/admin/leads",
        blurb: "Housing-intent CRM.",
      },
      {
        title: "Clients",
        href: "/admin/clients",
        blurb: "Applicant accounts.",
      },
      ...sharedBookingsResources,
    ],
  };
