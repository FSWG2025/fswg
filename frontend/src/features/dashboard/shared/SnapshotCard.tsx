import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { snapshotToneAt } from "./snapshotTones";

export type SnapshotCardProps = {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  index?: number;
  wide?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function SnapshotCard({
  label,
  value,
  sub,
  icon: Icon,
  index = 0,
  wide,
  onClick,
  className = "",
}: SnapshotCardProps) {
  const tone = snapshotToneAt(index);

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative min-w-0 flex-1 basis-full overflow-hidden rounded-2xl border p-4 text-left text-[#12213E] shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] transition hover:shadow-md min-[420px]:basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)] xl:basis-[calc(25%-0.5625rem)] ${tone.border} ${tone.bg} ${
        wide ? "min-[420px]:basis-full sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(50%-0.375rem)]" : ""
      } ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/40 blur-2xl transition group-hover:bg-white/55"
      />
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${tone.iconBg} ring-1 ring-[#12213E]/5`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="relative mt-4 text-2xl font-extrabold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="relative mt-0.5 text-sm font-semibold">{label}</p>
      <p className="relative mt-1 line-clamp-2 text-[11px] leading-snug text-[#6B7280]">
        {sub}
      </p>
    </motion.button>
  );
}
