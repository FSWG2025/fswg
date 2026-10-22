import type { RoleHubConfig } from "./types";
import { Gift, Target, TrendingUp, Users } from "lucide-react";

export const referral_partnerConfig: RoleHubConfig = {
    role: "referral_partner",
    subtitle:
      "Affiliate hub: share First Step, track invites, and grow community impact.",
    primaryCta: { label: "Referral hub", href: "/app/referrals" },
    snapshots: [
      {
        key: "code",
        label: "Your code",
        statKey: "inviteCode",
        sub: "Share link",
        icon: Gift,
        href: "/app/referrals",
        accent: true,
        format: "text",
      },
      {
        key: "signups",
        label: "Signups",
        statKey: "referralSignups",
        sub: "Attributed",
        icon: Users,
        href: "/app/referrals",
      },
      {
        key: "converted",
        label: "Converted",
        statKey: "referralConverted",
        sub: "Became clients",
        icon: TrendingUp,
        href: "/app/referrals",
      },
      {
        key: "clicks",
        label: "Clicks",
        statKey: "referralClicks",
        sub: "Link activity",
        icon: Target,
        href: "/app/referrals",
      },
    ],
    quickActions: [
      {
        id: "share",
        label: "Share",
        title: "Copy your invite link",
        body: "Send newcomers to First Step with your code.",
        cta: "Open referral hub",
        href: "/app/referrals",
      },
      {
        id: "learn",
        label: "Learn",
        title: "Know the pillars",
        body: "Rentals, insurance, real estate, wealth: pitch accurately.",
        cta: "Read blog",
        href: "/blog",
      },
    ],
    journey: [
      {
        id: "code",
        label: "Get code",
        href: "/app/referrals",
        doneWhen: (s) => !!s.inviteCode,
      },
      {
        id: "share",
        label: "Share",
        href: "/app/referrals",
        doneWhen: () => false,
      },
      {
        id: "signup",
        label: "First signup",
        href: "/app/referrals",
        doneWhen: (s) => (s.referralSignups || 0) > 0,
      },
      {
        id: "convert",
        label: "First convert",
        href: "/app/referrals",
        doneWhen: (s) => (s.referralConverted || 0) > 0,
      },
    ],
    features: [
      {
        id: "dash-share",
        eyebrow: "Feature 01 · Sharing",
        title: "Partner share checklist",
        body: "Compliant, helpful referrals only.",
        type: "checklist",
        checklistStorageKey: "fswg:referral:share",
        checklist: [
          { id: "audience", label: "Share with newcomers who need housing or protection" },
          { id: "honest", label: "No income or return promises" },
          { id: "link", label: "Always use your tracked link" },
          { id: "follow", label: "Follow up once, then let First Step advise" },
        ],
      },
      {
        id: "dash-kit",
        eyebrow: "Feature 02 · Creative kit",
        title: "Talking points",
        body: "What First Step actually offers.",
        type: "info",
        infoLines: [
          "Rental guarantee for newcomers without Canadian credit",
          "Insurance guidance and licensed advisor network path",
          "Real estate support with vetted agents and lenders",
          "Wealth education and consultation booking",
        ],
      },
    ],
    resources: [
      {
        title: "Referral hub",
        href: "/app/referrals",
        blurb: "Links and invites.",
      },
      {
        title: "Blog",
        href: "/blog",
        blurb: "Education to share.",
      },
      {
        title: "Account",
        href: "/app/settings",
        blurb: "Profile.",
      },
    ],
  };
