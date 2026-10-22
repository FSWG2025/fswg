import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Clock,
  DollarSign,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export const features = [
  {
    index: "/ 01",
    highlight: "the right coverage",
    before: "We help you find ",
    after: " for your family, without the jargon",
    body: "Life, health, and income protection plans that safeguard what matters most. We compare policies from Canada’s top insurance providers to find coverage that fits your budget, with clear explanations so you know what you are buying.",
    cta: "Get Free Insurance Review",
    action: "insurance" as const,
    visual: "coverage" as const,
  },
  {
    index: "/ 02",
    highlight: "a licensed advisor",
    before: "Transform your career: become ",
    after: " with guided training",
    body: "Our network brings together expert‑led training, mentorship, and a clear path to a rewarding career. Get licensed in as little as 8 weeks with our guided program, then help families protect their future.",
    cta: "Become a Financial Advisor",
    action: "advisor" as const,
    visual: "career" as const,
  },
  {
    index: "/ 03",
    highlight: "skills that pay off",
    before: "Master financial ",
    after: ": budgeting, protection, and wealth",
    body: "Our comprehensive program teaches the financial literacy most people never learn. You’ll build skills in insurance, investments, and wealth building, at your own pace, while earning as you grow.",
    cta: "See Benefits of Joining",
    action: "benefits" as const,
    visual: "skills" as const,
  },
];

export const opportunityStats = [
  { icon: DollarSign, value: "$100K+", label: "Possible annual income" },
  { icon: Users, value: "33+", label: "Trusted licensed advisors" },
  { icon: Clock, value: "8 Weeks", label: "Get trained & licensed" },
  { icon: Zap, value: "100%", label: "Remote & flexible" },
];

export const licensingSteps = [
  { title: "Online Application", desc: "Submit your interest form and we'll reach out within 24 hours." },
  { title: "Study Materials", desc: "Receive curated study guides, practice exams, and video lessons." },
  { title: "Licensing Exam", desc: "Take the provincial exam with confidence, 92% pass rate on first attempt." },
  { title: "Mentorship & Onboarding", desc: "Shadow a senior advisor and complete your first client meetings." },
];

export const benefits = [
  {
    title: "Life insurance when you join",
    body: "Qualify for top‑tier life insurance for yourself and your loved ones, at rates reserved for our team, with coverage from day one of training.",
  },
  {
    title: "Income helping families",
    body: "Every policy you secure is a step toward a family’s stability, and your financial freedom through recurring commission income.",
  },
  {
    title: "Career guidance",
    body: "Interview prep and job placement support, from your first licensing conversation through to a role helping families.",
  },
];

/** Cities from GlobalImpact where insurance / protection is part of what we offer */
export const reachPins = [
  { city: "Toronto", region: "Ontario", note: "Insurance Protection", families: "8+ families", lat: 43.6532, lng: -79.3832 },
  { city: "Vancouver", region: "British Columbia", note: "Cross‑border Insurance", families: "3+ families", lat: 49.2827, lng: -123.1207 },
  { city: "Edmonton", region: "Alberta", note: "Insurance Protection", families: "3+ families", lat: 53.5461, lng: -113.4938 },
  { city: "Winnipeg", region: "Manitoba", note: "Insurance Protection", families: "1+ families", lat: 49.8951, lng: -97.1384 },
];

export const mapPoints: [number, number][] = reachPins.map((p) => [p.lat, p.lng]);

export const pinIcon = L.divIcon({
  className: "fswg-map-pin",
  html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#12213E;border:3px solid #C69259;box-shadow:0 2px 8px rgba(18,33,62,0.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const FitCanada = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(points, { padding: [48, 48] });
  }, [map, points]);
  return null;
};

export const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const headlineMotion = (delay = 0) => ({
  initial: { opacity: 0, y: 22, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline whitespace-nowrap rounded-[10px] bg-[#C69259]/18 px-1.5 py-0.5 text-[#12213E]">
      {children}
    </span>
  );
}

export function PhoneVisual({ variant }: { variant: "coverage" | "career" | "skills" }) {
  const reduce = useReducedMotion();

  const panels = {
    coverage: {
      title: "Coverage match",
      rows: [
        { label: "Life protection", value: "Compared" },
        { label: "Income protection", value: "Reviewed" },
        { label: "Budget fit", value: "Aligned" },
      ],
      footer: "10+ insurers compared",
    },
    career: {
      title: "Advisor path",
      rows: [
        { label: "Licensing", value: "8 weeks" },
        { label: "Mentorship", value: "Included" },
        { label: "Work style", value: "Remote" },
      ],
      footer: "33+ advisors in network",
    },
    skills: {
      title: "What you learn",
      rows: [
        { label: "Insurance", value: "Mastered" },
        { label: "Wealth basics", value: "Built" },
        { label: "Client care", value: "Practiced" },
      ],
      footer: "Skills that stay with you",
    },
  }[variant];

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <motion.div
        aria-hidden
        className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-[#E4EFF8] via-[#F7EFE4] to-[#E4EFF8] opacity-90 blur-xl"
        animate={reduce ? undefined : { rotate: [0, 2, -2, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative overflow-hidden rounded-[36px] border border-[#12213E]/08 bg-white p-3 shadow-[0_30px_80px_rgba(18,33,62,0.14)]"
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <div className="rounded-[28px] bg-[#F7FBFE] p-5">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#12213E]/15" />
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12213E] text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#12213E]">{panels.title}</p>
              <p className="text-[11px] text-[#6B7280]">First Step Wealth Group</p>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {panels.rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center justify-between rounded-2xl bg-white px-3.5 py-3 shadow-sm"
              >
                <span className="text-sm font-medium text-[#12213E]">{row.label}</span>
                <span className="rounded-full bg-[#C69259]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#8A6840]">
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            {panels.footer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

