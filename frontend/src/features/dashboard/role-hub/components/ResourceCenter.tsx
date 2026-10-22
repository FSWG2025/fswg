import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { DASH } from "@/features/dashboard/shared/dashTokens";

type Resource = { title: string; href: string; blurb: string };

type Props = {
  title?: string;
  body?: string;
  resources: Resource[];
  className?: string;
};

export default function ResourceCenter({
  title = "Resource center",
  body,
  resources,
  className = "lg:col-span-7",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${DASH.panel} ${className}`}
    >
      <h3 className={DASH.title}>{title}</h3>
      {body ? <p className={`mt-0.5 text-xs text-[#6B7280]`}>{body}</p> : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {resources.map((r, i) => (
          <motion.div
            key={r.href + r.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
          >
            <Link
              to={r.href}
              className="group flex h-full items-start justify-between gap-3 rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-3.5 transition hover:-translate-y-0.5 hover:border-[#C69259]/40 hover:bg-white"
            >
              <div>
                <p className="text-sm font-bold text-[#12213E]">{r.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-[#6B7280]">
                  {r.blurb}
                </p>
              </div>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C69259] opacity-70 transition group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
