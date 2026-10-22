import { Link } from "react-router";
import {
  ArrowRight,
  Lightbulb,
  Phone,
  Share2,
  Target,
} from "lucide-react";
import type { ClientFeaturePanelsProps } from "../types";

export default function AdvisorGoalsPanel({
  navigate,
  goalOptions,
  goals,
  setGoals,
  user,
  stats,
  onBook,
  shareReferral,
  toggleList,
  resources,
}: ClientFeaturePanelsProps) {
  const advisor = stats?.assignedConsultant || user?.assignedConsultant;

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section
          id="dash-advisor"
          className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
            Feature 08 · Advisor connection
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#12213E]">
            Your First Step advisor
          </h3>
          {advisor ? (
            <div className="mt-4 rounded-2xl bg-[#F7FBFE] p-4">
              <p className="text-base font-bold text-[#12213E]">
                {advisor.name}
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {advisor.expertise || "Advisor"} · {advisor.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/app/messages")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Phone className="h-4 w-4" /> Message
                </button>
                <button
                  type="button"
                  onClick={onBook}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E5EAF0] px-4 py-2 text-sm font-semibold text-[#12213E]"
                >
                  Book again
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-[#FFF8F0] p-4">
              <p className="text-sm text-[#6B7280]">
                No advisor assigned yet. Book a discovery call and we will match
                you with the right support.
              </p>
              <button
                type="button"
                onClick={onBook}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#12213E] px-4 py-2 text-sm font-semibold text-white"
              >
                Book a consultation <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        <section
          id="dash-goals"
          className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
            Feature 09 · Goals board
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#12213E]">
            What are you working toward?
          </h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {goalOptions.map((g) => {
              const Icon = g.icon;
              const on = goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleList(goals, setGoals, g.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    on
                      ? "border-[#C69259] bg-[#FFF8F0]"
                      : "border-[#EEF2F6] bg-[#F7FBFE]"
                  }`}
                >
                  <Icon className="h-4 w-4 text-[#C69259]" />
                  <span className="text-sm font-semibold text-[#12213E]">
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          id="dash-resources"
          className="scroll-mt-24 rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6 lg:col-span-2"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C69259]">
                Feature 10 · Resources
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#12213E]">
                Newcomer resource center
              </h3>
              <p className="mt-1 text-sm text-[#6B7280]">
                Jump into the tools built for your First Step journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shareReferral}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F3DFC7] px-4 py-2.5 text-sm font-semibold text-[#12213E]"
              >
                <Share2 className="h-4 w-4" /> Share First Step
              </button>
              <Link
                to="/app/referrals"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F3DFC7] px-4 py-2.5 text-sm font-semibold text-[#12213E]"
              >
                <Lightbulb className="h-4 w-4" /> Referral Hub
              </Link>
            </div>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <Link
                key={r.href + r.title}
                to={r.href}
                className="rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-3 transition hover:border-[#C69259]/40"
              >
                <p className="flex items-center gap-2 text-sm font-bold text-[#12213E]">
                  <Target className="h-3.5 w-3.5 text-[#C69259]" />
                  {r.title}
                </p>
                <p className="mt-1 text-[11px] text-[#6B7280]">{r.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
