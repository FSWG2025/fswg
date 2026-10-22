import type { RoleHubConfig } from "./types";
import { sharedBookingsResources } from "./shared";
import { Calendar, FileText, MessageSquare, Users } from "lucide-react";

export const support_agentConfig: RoleHubConfig = {
    role: "support_agent",
    subtitle:
      "Front-line support hub: inbox, client lookup, escalations, and guided macros.",
    primaryCta: { label: "Open inbox", href: "/app/messages" },
    snapshots: [
      {
        key: "threads",
        label: "Threads",
        statKey: "openThreads",
        sub: "Message activity",
        icon: MessageSquare,
        href: "/app/messages",
        accent: true,
      },
      {
        key: "clients",
        label: "Active clients",
        statKey: "totalClients",
        sub: "Directory",
        icon: Users,
        href: "/admin/clients",
      },
      {
        key: "info",
        label: "Info requested",
        statKey: "pendingApplications",
        sub: "Rental follow-ups",
        icon: FileText,
        href: "/admin/rental-applications",
      },
      {
        key: "upcoming",
        label: "Upcoming",
        statKey: "upcomingConsultations",
        sub: "Bookings (read)",
        icon: Calendar,
        href: "/bookings",
      },
    ],
    quickActions: [
      {
        id: "inbox",
        label: "Inbox",
        title: "Triage messages",
        body: "Answer clients, escalate to consultants when needed.",
        cta: "Open messages",
        href: "/app/messages",
      },
      {
        id: "lookup",
        label: "Lookup",
        title: "Find a client",
        body: "Search the directory for account or booking help.",
        cta: "Open clients",
        href: "/admin/clients",
      },
      {
        id: "status",
        label: "Status",
        title: "Explain rental status",
        body: "Help clients understand info-requested applications.",
        cta: "View applications",
        href: "/admin/rental-applications",
      },
    ],
    journey: [
      {
        id: "triage",
        label: "Triage inbox",
        href: "/app/messages",
        doneWhen: () => false,
      },
      {
        id: "lookup",
        label: "Verify identity",
        href: "/admin/clients",
        doneWhen: () => false,
      },
      {
        id: "resolve",
        label: "Resolve or escalate",
        href: "/app/messages",
        doneWhen: () => false,
      },
      {
        id: "log",
        label: "Log outcome",
        href: "/app/notes",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-macros",
        eyebrow: "Feature 01 · Macros",
        title: "Support checklist",
        body: "Standard steps before closing a ticket.",
        type: "checklist",
        checklistStorageKey: "fswg:support:macros",
        checklist: [
          { id: "verify", label: "Verify client email / phone" },
          { id: "scope", label: "Confirm issue scope (login, docs, booking, rental)" },
          { id: "answer", label: "Send clear next step" },
          { id: "escalate", label: "Escalate to consultant if decision needed" },
          { id: "confirm", label: "Confirm client can proceed" },
        ],
      },
      {
        id: "dash-links",
        eyebrow: "Feature 02 · Quick links",
        title: "Help destinations",
        body: "Send clients to the right in-app tool.",
        type: "links",
        links: [
          {
            title: "Document vault help",
            href: "/app/documents",
            blurb: "Where clients upload ID and income.",
          },
          {
            title: "Book a call",
            href: "/bookings",
            blurb: "Consultation schedule.",
          },
          {
            title: "Account settings",
            href: "/app/settings",
            blurb: "Password and profile.",
          },
        ],
      },
      {
        id: "dash-rules",
        eyebrow: "Feature 03 · Guardrails",
        title: "What support can and cannot do",
        body: "Stay within policy while helping newcomers fast.",
        type: "info",
        infoLines: [
          "Can: explain statuses, guide uploads, reset password flow, escalate.",
          "Cannot: approve rentals, convert leads, publish content, delete users.",
          "Never share internal underwriting notes with clients.",
        ],
      },
    ],
    resources: [
      ...sharedBookingsResources,
      {
        title: "Clients",
        href: "/admin/clients",
        blurb: "Lookup directory.",
      },
      {
        title: "Rental apps",
        href: "/admin/rental-applications",
        blurb: "Read statuses for support answers.",
      },
      {
        title: "Notes",
        href: "/app/notes",
        blurb: "Private support scratchpad.",
      },
    ],
  };
