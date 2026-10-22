import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import type { FeatureModule } from "../configs/types";
import HubChecklist from "./HubChecklist";
import HubStatusChart from "./HubStatusChart";
import { DASH } from "@/features/dashboard/shared/dashTokens";

type Props = {
  feature: FeatureModule;
  stats: Record<string, any>;
  role: string;
  userKey: string;
  index?: number;
  /** When true, render chart-only body without outer section chrome (for hero chart slot). */
  bare?: boolean;
  /** Extra classes on the panel (e.g. lg:col-span-2 to avoid an empty rail gap). */
  className?: string;
  /** Full-width last row: lay link grids out horizontally on desktop. */
  wide?: boolean;
};

export default function HubFeaturePanel({
  feature,
  stats,
  role,
  userKey,
  index = 0,
  bare = false,
  className,
  wide = false,
}: Props) {
  const body = (
    <>
      {!bare && (
        <>
          <p className={DASH.eyebrow}>{feature.eyebrow}</p>
          <h3 className={`mt-1 ${DASH.title}`}>{feature.title}</h3>
          <p className={`mt-1 ${DASH.body}`}>{feature.body}</p>
        </>
      )}

      {feature.type === "checklist" && feature.checklist && (
        <div className={bare ? undefined : "mt-4"}>
          <HubChecklist
            storageKey={feature.checklistStorageKey || `fswg:${role}:list`}
            userKey={userKey}
            items={feature.checklist}
          />
        </div>
      )}

      {feature.type === "links" && feature.links && (
        <div
          className={`${bare ? "" : "mt-4"} grid gap-2 ${
            wide ? "sm:grid-cols-2 lg:grid-cols-3" : ""
          }`}
        >
          {feature.links.map((l) => (
            <Link
              key={l.href + l.title}
              to={l.href}
              className="group flex items-center justify-between rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] px-3.5 py-3 transition hover:-translate-y-0.5 hover:border-[#C69259]/40 hover:bg-white"
            >
              <div>
                <p className="text-sm font-bold text-[#12213E]">{l.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6B7280]">{l.blurb}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#C69259] transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}

      {feature.type === "info" && feature.infoLines && (
        <ul className={`${bare ? "" : "mt-4"} space-y-2`}>
          {feature.infoLines.map((line) => (
            <li
              key={line}
              className="rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] px-3.5 py-2.5 text-sm leading-relaxed text-[#334155]"
            >
              {line}
            </li>
          ))}
        </ul>
      )}

      {feature.type === "progress" && feature.progressStatKey && (
        <div className={bare ? undefined : "mt-5"}>
          <p className="text-3xl font-extrabold tabular-nums text-[#12213E]">
            {Number(stats[feature.progressStatKey]) || 0}%
          </p>
          <div className={`mt-3 ${DASH.progressTrack}`}>
            <motion.div
              className={DASH.progressFill}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Number(stats[feature.progressStatKey]) || 0)}%`,
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      )}

      {feature.type === "chart" && feature.chartStatKey && (
        <HubStatusChart
          data={(stats[feature.chartStatKey] || []).map((item: any) => ({
            name: String(item._id || item.name || "unknown").replace(/_/g, " "),
            count: item.count || 0,
          }))}
        />
      )}
    </>
  );

  if (bare) return body;

  return (
    <motion.section
      id={feature.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`scroll-mt-24 ${DASH.panel}${className ? ` ${className}` : ""}`}
    >
      {body}
    </motion.section>
  );
}
