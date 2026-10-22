import { motion } from "framer-motion";

type Stage = { name: string; value: number; fill: string };

type Props = {
  title: string;
  body: string;
  stages: Stage[];
  rateLabel?: string;
  rateValue?: string | number;
};

export default function FunnelStageChart({
  title,
  body,
  stages,
  rateLabel,
  rateValue,
}: Props) {
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_rgba(17,24,39,0.04)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#111827]">{title}</h3>
          <p className="mt-1 text-xs text-[#6B7280]">{body}</p>
        </div>
        {rateLabel != null && (
          <div className="rounded-2xl bg-[#EFF6FF] px-3.5 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3B82F6]">
              {rateLabel}
            </p>
            <p className="text-lg font-extrabold tabular-nums text-[#111827]">
              {rateValue}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {stages.map((stage, i) => (
          <div key={stage.name}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-[#374151]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: stage.fill }}
                />
                {stage.name}
              </span>
              <span className="text-xs font-bold tabular-nums text-[#111827]">
                {stage.value}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: stage.fill }}
                initial={{ width: 0 }}
                animate={{ width: `${(stage.value / max) * 100}%` }}
                transition={{
                  delay: 0.06 * i,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
