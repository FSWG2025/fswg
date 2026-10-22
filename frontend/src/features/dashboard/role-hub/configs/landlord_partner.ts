import type { RoleHubConfig } from "./types";
import { Building2, ClipboardCheck, Home, MessageSquare } from "lucide-react";

export const landlord_partnerConfig: RoleHubConfig = {
    role: "landlord_partner",
    subtitle:
      "Partner hub for property listings, guaranteed tenant matches, and lease documents.",
    primaryCta: { label: "Messages", href: "/app/messages" },
    snapshots: [
      {
        key: "properties",
        label: "Properties",
        statKey: "propertiesListed",
        sub: "Listed with First Step",
        icon: Building2,
        href: "/app/housing",
        accent: true,
      },
      {
        key: "active",
        label: "Active matches",
        statKey: "activeMatches",
        sub: "Guaranteed tenants",
        icon: Home,
        href: "/app/messages",
      },
      {
        key: "pending",
        label: "Pending",
        statKey: "pendingMatches",
        sub: "Awaiting your reply",
        icon: ClipboardCheck,
        href: "/app/messages",
      },
      {
        key: "msg",
        label: "Messages",
        statKey: "messages",
        sub: "With rental ops",
        icon: MessageSquare,
        href: "/app/messages",
      },
    ],
    quickActions: [
      {
        id: "list",
        label: "List",
        title: "Share a property",
        body: "Save city, rent, and availability preferences for matching.",
        cta: "Housing prefs",
        href: "/app/housing",
      },
      {
        id: "msg",
        label: "Message",
        title: "Talk to rental ops",
        body: "Ask about guarantee terms or pending matches.",
        cta: "Open messages",
        href: "/app/messages",
      },
      {
        id: "docs",
        label: "Docs",
        title: "Lease vault",
        body: "Upload lease PDFs and guarantee certificates.",
        cta: "Open vault",
        href: "/app/documents",
      },
    ],
    journey: [
      {
        id: "onboard",
        label: "Onboard",
        href: "/app/settings",
        doneWhen: () => true,
      },
      {
        id: "list",
        label: "List property",
        href: "/app/housing",
        doneWhen: () => false,
      },
      {
        id: "match",
        label: "Accept match",
        href: "/app/messages",
        doneWhen: () => false,
      },
      {
        id: "lease",
        label: "Lease active",
        href: "/app/documents",
        doneWhen: () => false,
      },
    ],
    features: [
      {
        id: "dash-partner",
        eyebrow: "Feature 01 · Partnership",
        title: "Landlord onboarding checklist",
        body: "Get ready to receive guaranteed newcomers.",
        type: "checklist",
        checklistStorageKey: "fswg:landlord:onboard",
        checklist: [
          { id: "profile", label: "Complete phone and address on profile" },
          { id: "property", label: "Add at least one property preference" },
          { id: "terms", label: "Confirm you understand guarantee terms" },
          { id: "docs", label: "Upload sample lease template (optional)" },
          { id: "contact", label: "Message ops to activate matching" },
        ],
      },
      {
        id: "dash-info",
        eyebrow: "Feature 02 · How it works",
        title: "Guarantee partnership basics",
        body: "First Step stands behind qualified newcomers.",
        type: "info",
        infoLines: [
          "You list available units and preferred tenant criteria.",
          "Rental specialists propose matched applicants.",
          "You accept or decline; PII expands after accept + consent.",
          "Guarantee certificate and lease docs live in your vault.",
        ],
      },
    ],
    resources: [
      {
        title: "Messages",
        href: "/app/messages",
        blurb: "Ops channel.",
      },
      {
        title: "Housing prefs",
        href: "/app/housing",
        blurb: "Property preferences.",
      },
      {
        title: "Document vault",
        href: "/app/documents",
        blurb: "Leases & certificates.",
      },
      {
        title: "Account",
        href: "/app/settings",
        blurb: "Profile & password.",
      },
    ],
  };
