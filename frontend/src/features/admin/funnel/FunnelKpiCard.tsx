import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  trend?: number | null;
  icon: LucideIcon;
  onDetails?: () => void;
  index?: number;
};

export default function FunnelKpiCard({
  label,
  value,
  trend,
  icon: Icon,
  onDetails,
  index = 0,
}: Props) {
  const up = trend == null ? null : trend >= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col rounded-[20px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_rgba(17,24,39,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#6B7280]">{label}</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-[#111827] sm:text-[28px]">
              {value}
            </p>
            {trend != null && (
              <span
                className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                  up
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FEF2F2] text-[#DC2626]"
                }`}
              >
                {up ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F3F6FB] text-[#12213E]">
          <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>

      <button
        type="button"
        onClick={onDetails}
        className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#3B82F6] transition hover:text-[#2563EB]"
      >
        View details
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}
