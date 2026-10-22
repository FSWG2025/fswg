/** Shared visual language for every First Step dashboard. */
export const DASH = {
  page: "min-h-screen flex-1 bg-[#EEF2F6] py-5 sm:py-6 md:py-8",
  container: "mx-auto w-[98%] space-y-5",
  panel:
    "rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6",
  panelHero:
    "w-full rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-7",
  warmPanel:
    "rounded-2xl border border-[#E8D5BC] bg-[#FBF4EB] p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6",
  darkPanel:
    "rounded-2xl border border-[#1a2d4d] bg-[#12213E] p-5 text-white shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.08)] sm:p-6",
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]",
  eyebrowMuted:
    "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]",
  title: "text-lg font-bold text-[#12213E]",
  body: "text-sm text-[#6B7280]",
  softInset: "rounded-[20px] bg-white/70 p-4",
  softBox: "rounded-2xl bg-[#F7FBFE] p-4",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#12213E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]",
  primaryBtnBlock:
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#12213E] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E] sm:w-auto sm:px-8",
  ghostTab:
    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition bg-white/60 text-[#12213E] hover:bg-white",
  activeTab: "rounded-full px-3.5 py-1.5 text-xs font-semibold transition bg-[#12213E] text-white",
  progressTrack: "h-2 overflow-hidden rounded-full bg-[#EEF2F6]",
  progressFill:
    "h-full rounded-full bg-gradient-to-r from-[#12213E] to-[#C69259]",
  limeBadge:
    "rounded-full bg-[#E8F5C8] px-3 py-1 text-sm font-bold text-[#3F6212]",
} as const;
