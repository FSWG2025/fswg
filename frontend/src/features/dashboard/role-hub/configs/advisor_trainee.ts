import type { RoleHubConfig } from "./types";
import { sharedBookingsResources } from "./shared";
import { Calendar, FileText, GraduationCap, MessageSquare } from "lucide-react";

export const advisor_traineeConfig: RoleHubConfig = {
    role: "advisor_trainee",
    subtitle:
      "Your path into the First Step advisor network: application, training, and mentorship.",
    primaryCta: { label: "My application", href: "/join-network" },
    snapshots: [
      {
        key: "training",
        label: "Training",
        statKey: "trainingProgress",
        sub: "Modules complete",
        icon: GraduationCap,
        href: "/join-network",
        accent: true,
        format: "percent",
      },
      {
        key: "upcoming",
        label: "Upcoming",
        statKey: "upcomingConsultations",
        sub: "Sessions",
        icon: Calendar,
        href: "/bookings",
      },
      {
        key: "apps",
        label: "My apps",
        statKey: "myApplications",
        sub: "If also a client",
        icon: FileText,
        href: "/rental-applications",
      },
      {
        key: "messages",
        label: "Messages",
        statKey: "unreadMessages",
        sub: "Mentor / support",
        icon: MessageSquare,
        href: "/app/messages",
      },
    ],
    quickActions: [
      {
        id: "train",
        label: "Train",
        title: "Continue academy",
        body: "Complete insurance, planning, CRM, and ethics modules.",
        cta: "View application",
        href: "/join-network",
      },
      {
        id: "mentor",
        label: "Mentor",
        title: "Message your mentor",
        body: "Ask questions and book coaching sessions.",
        cta: "Open messages",
        href: "/app/messages",
      },
      {
        id: "learn",
        label: "Learn",
        title: "Insurance planner",
        body: "Practice needs conversations with the planner tool.",
        cta: "Open planner",
        href: "/app/insurance-planner",
      },
    ],
    journey: [
      {
        id: "apply",
        label: "Apply",
        href: "/join-network",
        doneWhen: (s) => !!s.myApplication,
      },
      {
        id: "review",
        label: "Under review",
        href: "/join-network",
        doneWhen: (s) =>
          ["under_review", "approved", "enrolled"].includes(
            s.myApplication?.status,
          ),
      },
      {
        id: "train",
        label: "Train",
        href: "/join-network",
        doneWhen: (s) => (s.trainingProgress || 0) >= 50,
      },
      {
        id: "ethics",
        label: "Ethics",
        href: "/join-network",
        doneWhen: (s) => (s.trainingProgress || 0) >= 80,
      },
      {
        id: "enroll",
        label: "Enroll",
        href: "/join-network",
        doneWhen: (s) => s.myApplication?.status === "enrolled",
      },
    ],
    features: [
      {
        id: "dash-progress",
        eyebrow: "Feature 01 · Progress",
        title: "Training progress",
        body: "Your module completion across the advisor academy.",
        type: "progress",
        progressStatKey: "trainingProgress",
      },
      {
        id: "dash-study",
        eyebrow: "Feature 02 · Study plan",
        title: "Weekly study checklist",
        body: "Build the habit before your license exam.",
        type: "checklist",
        checklistStorageKey: "fswg:trainee:study",
        checklist: [
          { id: "module", label: "Complete one academy module" },
          { id: "mentor", label: "Message mentor with one question" },
          { id: "roleplay", label: "Practice a 5-minute discovery opener" },
          { id: "ethics", label: "Re-read ethics notes" },
          { id: "docs", label: "Upload any new certificates to vault" },
        ],
      },
      {
        id: "dash-tools",
        eyebrow: "Feature 03 · Practice tools",
        title: "Client tools to master",
        body: "Know what newcomers experience in the hub.",
        type: "links",
        links: [
          {
            title: "Insurance planner",
            href: "/app/insurance-planner",
            blurb: "Coverage conversations.",
          },
          {
            title: "Wealth studio",
            href: "/app/wealth-studio",
            blurb: "Illustrative savings talks.",
          },
          {
            title: "Document vault",
            href: "/app/documents",
            blurb: "How clients share files.",
          },
        ],
      },
    ],
    resources: [
      {
        title: "Join network",
        href: "/join-network",
        blurb: "Application & status.",
      },
      ...sharedBookingsResources,
      {
        title: "Insurance planner",
        href: "/app/insurance-planner",
        blurb: "Practice tool.",
      },
      {
        title: "Vault",
        href: "/app/documents",
        blurb: "Certificates & ID.",
      },
    ],
  };
