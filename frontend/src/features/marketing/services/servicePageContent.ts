import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BarChart3,
  Briefcase,
  Building2,
  GraduationCap,
  Home,
  KeyRound,
  LineChart,
  Shield,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import type { Service } from "@/types";

export type ServiceVisual = {
  href: string;
  image: string;
  accentLabel: string;
  icon: LucideIcon;
  bullets: string[];
  eyebrow: string;
};

const IMAGES = {
  rental:
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  insurance:
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  advisor:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1200&q=80",
  realEstate:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  wealth:
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=1200&q=80",
  education:
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
  hero:
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80",
  team:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
};

const BY_TITLE: Record<string, Partial<ServiceVisual>> = {
  "Rental Guarantee": {
    href: "/rental-guarantee",
    image: IMAGES.rental,
    accentLabel: "Housing",
    icon: KeyRound,
    eyebrow: "For newcomers without Canadian credit",
  },
  "Insurance Advisory": {
    href: "/insurance",
    image: IMAGES.insurance,
    accentLabel: "Protection",
    icon: Shield,
    eyebrow: "Family coverage without the sales pitch",
  },
  "Advisor Career Path": {
    href: "/insurance",
    image: IMAGES.advisor,
    accentLabel: "Careers",
    icon: Briefcase,
    eyebrow: "Build a licensed advisory career",
  },
  "Real Estate Support": {
    href: "/real-estate",
    image: IMAGES.realEstate,
    accentLabel: "Homeownership",
    icon: Building2,
    eyebrow: "From first viewing to closing day",
  },
  "Wealth Education": {
    href: "/wealth",
    image: IMAGES.wealth,
    accentLabel: "Wealth",
    icon: LineChart,
    eyebrow: "See how consistent savings can grow",
  },
  "Financial Education": {
    href: "/about",
    image: IMAGES.education,
    accentLabel: "Education",
    icon: GraduationCap,
    eyebrow: "Banking, credit, and money basics",
  },
};

const BY_CATEGORY: Record<string, Partial<ServiceVisual>> = {
  real_estate: {
    href: "/real-estate",
    image: IMAGES.realEstate,
    icon: Home,
    accentLabel: "Housing",
    eyebrow: "Housing & real estate pathways",
  },
  insurance: {
    href: "/insurance",
    image: IMAGES.insurance,
    icon: Shield,
    accentLabel: "Insurance",
    eyebrow: "Coverage that fits your family",
  },
  wealth_building: {
    href: "/wealth",
    image: IMAGES.wealth,
    icon: BarChart3,
    accentLabel: "Wealth",
    eyebrow: "Long-term wealth building",
  },
  financial_education: {
    href: "/about",
    image: IMAGES.education,
    icon: GraduationCap,
    accentLabel: "Education",
    eyebrow: "Financial confidence from day one",
  },
  entrepreneurship: {
    href: "/insurance",
    image: IMAGES.advisor,
    icon: Briefcase,
    accentLabel: "Careers",
    eyebrow: "Grow as an advisor",
  },
};

export type EnrichedService = Omit<Service, "icon"> & ServiceVisual;

export function enrichService(svc: Service): EnrichedService {
  const fromTitle = BY_TITLE[svc.title] || {};
  const fromCat = BY_CATEGORY[svc.category] || {};
  const icon = fromTitle.icon || fromCat.icon || Sparkles;
  const bullets =
    svc.features && svc.features.length > 0
      ? svc.features
      : [
          "Clear next steps after your free discovery call",
          "Guidance tailored to newcomers and families in Canada",
          "Independent advice: we do not push proprietary products",
        ];

  const { icon: _ignored, ...rest } = svc;

  return {
    ...rest,
    href: fromTitle.href || fromCat.href || "/#cta",
    image: fromTitle.image || fromCat.image || IMAGES.hero,
    accentLabel: fromTitle.accentLabel || fromCat.accentLabel || "Service",
    icon,
    bullets,
    eyebrow:
      fromTitle.eyebrow ||
      fromCat.eyebrow ||
      "First Step Wealth Group support",
  };
}

export const HERO_IMAGES = IMAGES;

export const WHY_PILLARS = [
  {
    icon: BadgeCheck,
    title: "Newcomer-first design",
    body: "Every pathway: rentals, insurance, wealth, real estate: is built for people navigating Canada’s financial system for the first time.",
  },
  {
    icon: Users,
    title: "Human guidance, not hard sells",
    body: "The initial discovery call is always free. We educate first so you understand every decision before you commit.",
  },
  {
    icon: Wallet,
    title: "Practical paths that stack",
    body: "Secure housing, protect your family, build credit and savings: then grow into homeownership or an advisor career when you are ready.",
  },
] as const;

export const IMPACT_STATS = [
  { value: "6+", label: "Core service pathways" },
  { value: "0$", label: "Discovery call fee" },
  { value: "CA", label: "Nationwide focus" },
  { value: "1:1", label: "Advisor conversations" },
] as const;
