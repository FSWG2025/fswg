import type { RoleHubConfig } from "./types";
import { sharedBookingsResources } from "./shared";
import { Calendar, ClipboardCheck, GraduationCap, Users, Video } from "lucide-react";

export const mentorConfig: RoleHubConfig = {
    role: "mentor",
    subtitle:
      "Coach advisor trainees: sessions, module progress, and enrollment recommendations.",
    primaryCta: {
      label: "View mentees",
      href: "/admin/advisor-applications",
    },
    snapshots: [
      {
        key: "mentees",
        label: "Mentees",
        statKey: "mentees",
        sub: "Assigned to you",
        icon: GraduationCap,
        href: "/admin/advisor-applications",
        accent: true,
      },
      {
        key: "review",
        label: "In review",
        statKey: "underReview",
        sub: "Network-wide",
        icon: ClipboardCheck,
        href: "/admin/advisor-applications",
      },
      {
        key: "enrolled",
        label: "Enrolled",
        statKey: "enrolled",
        sub: "Training",
        icon: Users,
        href: "/admin/advisor-applications",
      },
      {
        key: "bookings",
        label: "Sessions",
        statKey: "upcomingConsultations",
        sub: "Your calendar",
        icon: Calendar,
        href: "/bookings",
      },
    ],
    quickActions: [
      {
        id: "mentees",
        label: "Mentees",
        title: "Open mentee board",
        body: "Review training progress and leave notes.",
        cta: "Open applications",
        href: "/admin/advisor-applications",
      },
      {
        id: "session",
        label: "Session",
        title: "Run a mentoring call",
        body: "Use bookings and video rooms for coaching.",
        cta: "Open bookings",
        href: "/bookings",
      },
    ],
    journey: [
      {
        id: "review",
        label: "Review progress",
        href: "/admin/advisor-applications",
        doneWhen: (s) => (s.mentees || 0) > 0,
      },
      {
        id: "coach",
        label: "Coach session",
        href: "/bookings",
        doneWhen: () => false,
      },
      {
        id: "modules",
        label: "Update modules",
        href: "/admin/advisor-applications",
        doneWhen: () => false,
      },
      {
        id: "recommend",
        label: "Recommend enroll",
        href: "/admin/advisor-applications",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-coach",
        eyebrow: "Feature 01 · Coaching",
        title: "Session checklist",
        body: "Structure every mentoring call.",
        type: "checklist",
        checklistStorageKey: "fswg:mentor:session",
        checklist: [
          { id: "progress", label: "Review module completion %" },
          { id: "blockers", label: "Capture blockers / homework" },
          { id: "roleplay", label: "Role-play client discovery" },
          { id: "ethics", label: "Reinforce ethics & disclosures" },
          { id: "next", label: "Schedule next session" },
        ],
      },
      {
        id: "dash-msg",
        eyebrow: "Feature 02 · Presence",
        title: "Stay available",
        body: "Message and meet mentees inside First Step.",
        type: "links",
        links: [
          {
            title: "Messages",
            href: "/app/messages",
            blurb: "Async coaching.",
          },
          {
            title: "Video",
            href: "/app/video",
            blurb: "Live mentoring rooms.",
          },
          {
            title: "Applications",
            href: "/admin/advisor-applications",
            blurb: "Training board.",
          },
        ],
      },
    ],
    resources: [
      ...sharedBookingsResources,
      {
        title: "Advisor applications",
        href: "/admin/advisor-applications",
        blurb: "Mentee training.",
      },
      {
        title: "Video",
        href: "/app/video",
        blurb: "Live sessions.",
      },
    ],
  };
