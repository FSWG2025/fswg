import type { RoleHubConfig } from "./types";
import { sharedBookingsResources } from "./shared";
import { Calendar, ClipboardCheck, FileText, Target, Users, Video } from "lucide-react";

export const consultantConfig: RoleHubConfig = {
    role: "consultant",
    subtitle:
      "Your advisor hub for leads, consultations, rental reviews, and client care.",
    primaryCta: { label: "Open leads", href: "/admin/leads" },
    snapshots: [
      {
        key: "leads",
        label: "My leads",
        statKey: "myLeads",
        sub: "Assigned pipeline",
        icon: Target,
        href: "/admin/leads",
        accent: true,
      },
      {
        key: "upcoming",
        label: "Upcoming",
        statKey: "upcomingConsultations",
        sub: "Consultations",
        icon: Calendar,
        href: "/bookings",
      },
      {
        key: "completed",
        label: "Completed",
        statKey: "completedConsultations",
        sub: "All time",
        icon: ClipboardCheck,
        href: "/bookings/completed",
      },
      {
        key: "clients",
        label: "My clients",
        statKey: "myClients",
        sub: "Active relationships",
        icon: Users,
        href: "/admin/clients",
      },
      {
        key: "apps",
        label: "Pending apps",
        statKey: "pendingApplications",
        sub: "Rental queue",
        icon: FileText,
        href: "/admin/rental-applications",
      },
    ],
    quickActions: [
      {
        id: "lead",
        label: "Lead",
        title: "Work your pipeline",
        body: "Contact new leads, update status, and convert qualified prospects.",
        cta: "Open leads",
        href: "/admin/leads",
      },
      {
        id: "book",
        label: "Bookings",
        title: "Today’s consultations",
        body: "Join video, add notes, and mark sessions complete.",
        cta: "Open bookings",
        href: "/bookings",
      },
      {
        id: "rent",
        label: "Rentals",
        title: "Review applications",
        body: "Add internal notes, request info, or advance status.",
        cta: "Review apps",
        href: "/admin/rental-applications",
      },
      {
        id: "msg",
        label: "Message",
        title: "Client inbox",
        body: "Follow up with assigned clients without leaving the hub.",
        cta: "Open messages",
        href: "/app/messages",
      },
    ],
    journey: [
      {
        id: "contact",
        label: "Contact leads",
        href: "/admin/leads/new",
        doneWhen: (s) => (s.newMyLeads || 0) === 0 && (s.myLeads || 0) > 0,
      },
      {
        id: "book",
        label: "Book consults",
        href: "/bookings",
        doneWhen: (s) => (s.upcomingConsultations || 0) > 0,
      },
      {
        id: "convert",
        label: "Convert clients",
        href: "/admin/clients",
        doneWhen: (s) => (s.myClients || 0) > 0,
      },
      {
        id: "review",
        label: "Review rentals",
        href: "/admin/rental-applications",
        doneWhen: (s) => (s.pendingApplications || 0) === 0,
      },
      {
        id: "follow",
        label: "Follow up",
        href: "/app/messages",
        doneWhen: (s) => (s.unreadMessages || 0) === 0,
      },
    ],
    features: [
      {
        id: "dash-pipeline",
        eyebrow: "Feature 01 · Pipeline",
        title: "Lead pipeline map",
        body: "Track new → contacted → qualified → converted for your book.",
        type: "chart",
        chartStatKey: "leadsByStatus",
      },
      {
        id: "dash-prep",
        eyebrow: "Feature 02 · Session prep",
        title: "Consultation readiness",
        body: "Check off prep before each discovery or follow-up call.",
        type: "checklist",
        checklistStorageKey: "fswg:consultant:prep",
        checklist: [
          { id: "review-lead", label: "Review lead interest and notes" },
          { id: "vault", label: "Confirm client uploaded ID / income docs" },
          { id: "room", label: "Test video room link" },
          { id: "script", label: "Skim discovery script for their pillar" },
          { id: "followup", label: "Prepare next-step options (rent / insure / wealth)" },
        ],
      },
      {
        id: "dash-health",
        eyebrow: "Feature 03 · Client care",
        title: "Client health shortcuts",
        body: "Jump into the tools your assigned clients use every day.",
        type: "links",
        links: [
          {
            title: "Clients directory",
            href: "/admin/clients",
            blurb: "Open assigned client profiles.",
          },
          {
            title: "Rental applications",
            href: "/admin/rental-applications",
            blurb: "Status, docs, internal notes.",
          },
          {
            title: "Messages",
            href: "/app/messages",
            blurb: "Secure follow-ups.",
          },
          {
            title: "Video rooms",
            href: "/app/video",
            blurb: "Join private consultation calls.",
          },
        ],
      },
    ],
    resources: [
      ...sharedBookingsResources,
      {
        title: "Leads",
        href: "/admin/leads",
        blurb: "Full lead CRM for your assignments.",
      },
      {
        title: "Clients",
        href: "/admin/clients",
        blurb: "People assigned to you.",
      },
      {
        title: "Rental queue",
        href: "/admin/rental-applications",
        blurb: "Guarantee applications needing review.",
      },
      {
        title: "Video",
        href: "/app/video",
        blurb: "In-app consultation rooms.",
      },
    ],
  };
