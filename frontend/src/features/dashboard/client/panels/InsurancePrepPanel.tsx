import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { ClientFeaturePanelsProps } from "../types";

export default function InsurancePrepPanel({
  navigate,
  insuranceOptions,
  insurancePick,
  setInsurancePick,
  prepItems,
  prep,
  setPrep,
  toggleList,
}: ClientFeaturePanelsProps) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-2">
      <section
        id="dash-insurance"
        className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
          Feature 04 · Insurance path
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#12213E]">
          Insurance interest finder
        </h3>
        <p className="mt-1 text-sm text-[#6B7280]">
          Select what you want to explore. Choices stay on this device.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {insuranceOptions.map((opt) => {
            const on = insurancePick.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  toggleList(insurancePick, setInsurancePick, opt.id)
                }
                className={`rounded-2xl border p-3 text-left transition ${
                  on
                    ? "border-[#C69259] bg-[#FFF8F0]"
                    : "border-[#EEF2F6] bg-[#F7FBFE] hover:border-[#C69259]/30"
                }`}
              >
                <p className="text-sm font-bold text-[#12213E]">{opt.label}</p>
                <p className="mt-1 text-[11px] text-[#6B7280]">{opt.desc}</p>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/insurance-planner")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
        >
          Open insurance planner <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <section
        id="dash-prep"
        className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
          Feature 05 · Consultation prep
        </p>
        <h3 className="mt-1 text-lg font-bold text-[#12213E]">
          Get ready for your call
        </h3>
        <p className="mt-1 text-sm text-[#6B7280]">
          A short checklist so your discovery call is productive.
        </p>
        <ul className="mt-4 space-y-2">
          {prepItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setPrep((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[#F7FBFE]"
              >
                {prep[item.id] ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#65A30D]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                )}
                <span
                  className={`text-sm ${
                    prep[item.id]
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
          onClick={() => navigate("/bookings")}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#C69259]"
        >
          View bookings <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
