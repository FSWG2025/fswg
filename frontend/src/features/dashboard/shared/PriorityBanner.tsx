import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
};

/** Soft warm priority strip: matches client craft, not harsh alert UI. */
export default function PriorityBanner({
  icon: Icon,
  title,
  body,
  cta,
  onClick,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 rounded-2xl border border-[#F0C9B0] bg-[#FFF1EB] p-4 sm:flex-row sm:items-center sm:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80">
        <Icon className="h-5 w-5 text-[#C69259]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#12213E]">{title}</p>
        <p className="mt-0.5 text-xs text-[#6B7280]">{body}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#12213E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0D1A2E]"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
