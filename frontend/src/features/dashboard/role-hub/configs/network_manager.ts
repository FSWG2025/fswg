import type { RoleHubConfig } from "./types";
import { ClipboardCheck, GraduationCap, TrendingUp, Users } from "lucide-react";

export const network_managerConfig: RoleHubConfig = {
    role: "network_manager",
    subtitle:
      "Advisor network recruiting: applications, mentors, training, enrollment.",
    primaryCta: {
      label: "Review applications",
      href: "/admin/advisor-applications",
    },
    snapshots: [
      {
        key: "submitted",
        label: "Submitted",
        statKey: "submitted",
        sub: "New applicants",
        icon: GraduationCap,
        href: "/admin/advisor-applications",
        accent: true,
      },
      {
        key: "review",
        label: "In review",
        statKey: "underReview",
        sub: "Interviewing",
        icon: ClipboardCheck,
        href: "/admin/advisor-applications",
      },
      {
        key: "enrolled",
        label: "Enrolled",
        statKey: "enrolled",
        sub: "In training / live",
        icon: Users,
        href: "/admin/advisor-applications",
      },
      {
        key: "funnel",
        label: "Funnel",
        statKey: "pendingAdvisorApps",
        sub: "Needs action",
        icon: TrendingUp,
        href: "/admin/funnel",
      },
    ],
    quickActions: [
      {
        id: "review",
        label: "Review",
        title: "Score applications",
        body: "Move submitted applicants into under review or reject.",
        cta: "Open applications",
        href: "/admin/advisor-applications",
      },
      {
        id: "mentor",
        label: "Mentor",
        title: "Assign mentors",
        body: "Pair approved trainees with experienced mentors.",
        cta: "Manage network",
        href: "/admin/advisor-applications",
      },
      {
        id: "analytics",
        label: "Analytics",
        title: "Network funnel",
        body: "Approval rates and enrollment progress.",
        cta: "Open funnel",
        href: "/admin/funnel",
      },
    ],
    journey: [
      {
        id: "intake",
        label: "Intake",
        href: "/admin/advisor-applications",
        doneWhen: (s) => (s.submitted || 0) === 0,
      },
      {
        id: "interview",
        label: "Interview",
        href: "/admin/advisor-applications",
        doneWhen: (s) => (s.underReview || 0) >= 0,
      },
      {
        id: "train",
        label: "Train",
        href: "/admin/advisor-applications",
        doneWhen: (s) => (s.enrolled || 0) > 0,
      },
      {
        id: "place",
        label: "Place",
        href: "/admin/clients",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-train",
        eyebrow: "Feature 01 · Academy",
        title: "Training modules to track",
        body: "Every enrolled advisor completes these six modules.",
        type: "info",
        infoLines: [
          "Introduction to Insurance",
          "Financial Planning Basics",
          "Client Relationship Management",
          "Product Knowledge",
          "Sales & Marketing",
          "Ethics & Compliance",
        ],
      },
      {
        id: "dash-checklist",
        eyebrow: "Feature 02 · Enrollment",
        title: "Enrollment checklist",
        body: "Before promoting a trainee to consultant.",
        type: "checklist",
        checklistStorageKey: "fswg:network:enroll",
        checklist: [
          { id: "interview", label: "Interview scored" },
          { id: "mentor", label: "Mentor assigned" },
          { id: "modules", label: "Core modules ≥ 80%" },
          { id: "ethics", label: "Ethics module completed" },
          { id: "license", label: "License / appointment docs in vault" },
        ],
      },
    ],
    resources: [
      {
        title: "Advisor applications",
        href: "/admin/advisor-applications",
        blurb: "Network pipeline.",
      },
      {
        title: "Funnel",
        href: "/admin/funnel",
        blurb: "Approval analytics.",
      },
      {
        title: "Join network (preview)",
        href: "/join-network",
        blurb: "What applicants see.",
      },
    ],
  };
