export const FUNNEL_PALETTE = {
  navy: "#12213E",
  gold: "#C69259",
  blue: "#3B82F6",
  blueSoft: "#60A5FA",
  lime: "#10B981",
  lilac: "#8B5CF6",
  peach: "#F0C9B0",
  blush: "#F472B6",
  sky: "#38BDF8",
  mint: "#34D399",
  amber: "#F59E0B",
  slate: "#94A3B8",
} as const;

export const LEAD_STAGE_COLORS = [
  FUNNEL_PALETTE.blue,
  FUNNEL_PALETTE.sky,
  FUNNEL_PALETTE.lilac,
  FUNNEL_PALETTE.lime,
  FUNNEL_PALETTE.slate,
];

export const ADVISOR_STAGE_COLORS = [
  FUNNEL_PALETTE.sky,
  FUNNEL_PALETTE.amber,
  FUNNEL_PALETTE.lime,
  FUNNEL_PALETTE.lilac,
  FUNNEL_PALETTE.blush,
];

/** Complements FSWG navy + gold */
export const INTEREST_COLORS = [
  FUNNEL_PALETTE.navy,
  FUNNEL_PALETTE.gold,
  "#6E93B5",
  "#D4A574",
  "#8FA3B8",
];
