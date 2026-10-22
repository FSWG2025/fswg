import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { DASH } from "./dashTokens";

export type JourneyMapStep = {
  id: string;
  label: string;
  done: boolean;
  onClick?: () => void;
};

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  body: string;
  steps: JourneyMapStep[];
  columnsClassName?: string;
};

export default function JourneyMap({
  id = "dash-journey",
  eyebrow = "Feature 01 · Journey",
  title,
  body,
  steps,
  columnsClassName = "sm:grid-cols-2 lg:grid-cols-5",
}: Props) {
  const pct = Math.round(
    (steps.filter((s) => s.done).length / Math.max(steps.length, 1)) * 100,
  );

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`scroll-mt-24 ${DASH.panel}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={DASH.eyebrow}>{eyebrow}</p>
          <h3 className={`mt-1 ${DASH.title}`}>{title}</h3>
          <p className={`mt-1 ${DASH.body}`}>{body}</p>
        </div>
        <span className={DASH.limeBadge}>{pct}% complete</span>
      </div>
      <div className={`mt-4 ${DASH.progressTrack}`}>
        <motion.div
          className={DASH.progressFill}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className={`mt-5 grid gap-3 ${columnsClassName}`}>
        {steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={step.onClick}
            className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
              step.done
                ? "border-[#C69259]/40 bg-[#FFF8F0]"
                : "border-dashed border-[#12213E]/12 bg-[#F7FBFE]"
            }`}
          >
            <div className="flex items-center gap-2">
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C69259]" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
              )}
              <span className="text-xs font-bold text-[#12213E]">{step.label}</span>
            </div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}
