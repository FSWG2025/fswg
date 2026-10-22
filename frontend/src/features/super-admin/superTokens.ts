/** Soft SaaS Command Center tokens: FSWG navy + gold on Notalx-like light chrome. */
export const SUPER = {
  page: "min-h-[100dvh] bg-[#F4F6F8] text-[#12213E]",
  shell: "flex min-h-[100dvh] w-full",
  side:
    "flex w-[232px] shrink-0 flex-col border-r border-[#E8ECF1] bg-[#FBFBFC] px-4 py-5",
  main: "flex min-w-0 flex-1 flex-col",
  topBar:
    "flex h-[64px] shrink-0 items-center gap-3 border-b border-[#E8ECF1] bg-[#FBFBFC]/90 px-4 backdrop-blur-md sm:px-6",
  content: "flex-1 overflow-y-auto p-4 sm:p-6",
  card:
    "rounded-[18px] border border-[#E8ECF1] bg-white p-4 shadow-[0_1px_2px_rgba(18,33,62,0.03),0_10px_28px_rgba(18,33,62,0.04)] sm:p-5",
  cardQuiet:
    "rounded-[18px] border border-transparent bg-white/70 p-4 sm:p-5",
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C69259]",
  title: "text-[17px] font-bold tracking-tight text-[#12213E]",
  body: "text-sm leading-relaxed text-[#6B7280]",
  navIdle:
    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] font-medium text-[#64748B] transition hover:bg-white hover:text-[#12213E]",
  navActive:
    "flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-[13px] font-semibold text-[#12213E] shadow-[0_1px_3px_rgba(18,33,62,0.06)] ring-1 ring-[#E8ECF1]",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0D1A2E]",
  softBtn:
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8ECF1] bg-white px-4 py-2.5 text-sm font-semibold text-[#12213E] transition hover:border-[#C69259]/40 hover:bg-[#FBF4EB]",
  armedBtn:
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-[#C69259] bg-white px-3.5 py-2 text-sm font-semibold text-[#C69259] transition hover:bg-[#FBF4EB]",
  dangerBtn:
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#B91C1C] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#991B1B]",
  ghostLink:
    "text-xs font-semibold text-[#C69259] underline-offset-2 hover:underline",
  input:
    "w-full rounded-2xl border border-[#E8ECF1] bg-white px-4 py-2.5 text-sm text-[#12213E] outline-none placeholder:text-[#94A3B8] focus:border-[#C69259]/60 focus:ring-2 focus:ring-[#C69259]/15",
  badge:
    "inline-flex items-center gap-1.5 rounded-full bg-[#12213E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
  goldBadge:
    "inline-flex items-center gap-1.5 rounded-full bg-[#C69259]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9A6B35]",
  statusPill:
    "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#12213E] ring-1 ring-[#E8ECF1]",
  accentGrad:
    "rounded-[20px] bg-gradient-to-br from-[#12213E] via-[#1a3358] to-[#C69259] p-4 text-white shadow-[0_12px_32px_rgba(18,33,62,0.22)]",
  ledOk: "h-2 w-2 rounded-full bg-emerald-500",
  ledWarn: "h-2 w-2 rounded-full bg-amber-500",
  ledCrit: "h-2 w-2 rounded-full bg-red-500",
  ledMaint: "h-2 w-2 rounded-full bg-[#C69259]",
  panel: // alias for older pages
    "rounded-[18px] border border-[#E8ECF1] bg-white p-4 text-[#12213E] shadow-[0_1px_2px_rgba(18,33,62,0.03),0_10px_28px_rgba(18,33,62,0.04)] sm:p-5",
  panelSoft:
    "rounded-[18px] border border-[#E8D5BC] bg-[#FBF4EB] p-4 text-[#12213E] sm:p-5",
  goldRule: "h-px w-full bg-gradient-to-r from-transparent via-[#C69259]/50 to-transparent",
} as const;

export type SystemStatus = "OK" | "DEGRADED" | "MAINTENANCE" | "LOCKDOWN";

export function statusLed(status: SystemStatus) {
  switch (status) {
    case "OK":
      return SUPER.ledOk;
    case "DEGRADED":
      return SUPER.ledWarn;
    case "MAINTENANCE":
      return SUPER.ledMaint;
    case "LOCKDOWN":
      return SUPER.ledCrit;
    default:
      return SUPER.ledWarn;
  }
}
