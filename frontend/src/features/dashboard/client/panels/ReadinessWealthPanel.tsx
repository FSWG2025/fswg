import { ArrowRight, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import type { ClientFeaturePanelsProps } from "../types";

export default function ReadinessWealthPanel({
  navigate,
  readinessItems,
  readiness,
  setReadiness,
  readinessPct,
  monthlySave,
  setMonthlySave,
  years,
  setYears,
  rate,
  setRate,
  wealthFuture,
}: ClientFeaturePanelsProps) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <section
        id="dash-readiness"
        className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
          Feature 02 · Rental readiness
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#12213E]">
            Rental readiness score
          </h3>
          <span className="text-sm font-bold text-[#12213E]">{readinessPct}%</span>
        </div>
        <p className="mt-1 text-sm text-[#6B7280]">
          Check off what you have prepared before applying for rental support.
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
          <div
            className="h-full rounded-full bg-[#A3E635] transition-all duration-500"
            style={{ width: `${readinessPct}%` }}
          />
        </div>
        <ul className="mt-4 space-y-2">
          {readinessItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setReadiness((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#F7FBFE]"
              >
                {readiness[item.id] ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#65A30D]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                )}
                <span
                  className={`text-sm ${
                    readiness[item.id]
                      ? "font-medium text-[#12213E] line-through opacity-60"
                      : "text-[#334155]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => navigate("/rental-applications/new")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
        >
          Start rental application <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section
        id="dash-wealth"
        className="scroll-mt-24 rounded-2xl border border-[#1a2d4d] bg-[#12213E] p-5 text-white shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.08)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
          Feature 03 · Wealth pulse
        </p>
        <h3 className="mt-1 text-lg font-bold">Savings growth snapshot</h3>
        <p className="mt-1 text-sm text-white/65">
          Illustrative projection only. Not investment advice.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="block text-xs text-white/60">
            Monthly save (CAD)
            <input
              type="number"
              min={0}
              value={monthlySave}
              onChange={(e) => setMonthlySave(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none ring-1 ring-white/15 focus:ring-[#C69259]"
            />
          </label>
          <label className="block text-xs text-white/60">
            Years
            <input
              type="number"
              min={1}
              max={40}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none ring-1 ring-white/15 focus:ring-[#C69259]"
            />
          </label>
          <label className="block text-xs text-white/60">
            Annual rate %
            <input
              type="number"
              min={0}
              max={15}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none ring-1 ring-white/15 focus:ring-[#C69259]"
            />
          </label>
        </div>
        <p className="mt-6 text-3xl font-extrabold tracking-tight text-[#E8F5C8]">
          {wealthFuture.toLocaleString("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
          })}
        </p>
        <p className="mt-1 text-xs text-white/50">
          Estimated future value of consistent monthly savings
        </p>
        <button
          type="button"
          onClick={() => navigate("/app/wealth-studio")}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#C69259] px-4 py-2.5 text-sm font-semibold text-[#12213E]"
        >
          <TrendingUp className="h-4 w-4" />
          Open Wealth Studio
        </button>
      </section>
    </div>
  );
}
