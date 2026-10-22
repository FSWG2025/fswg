import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { DASH } from "./dashTokens";

export type QuickActionTab = {
  id: string;
  label: string;
  title: string;
  body: string;
  cta: string;
};

type Props = {
  tabs: QuickActionTab[];
  activeId: string;
  onTabChange: (id: string) => void;
  onAction: () => void;
  className?: string;
};

export default function QuickActionPanel({
  tabs,
  activeId,
  onTabChange,
  onAction,
  className = "lg:col-span-5",
}: Props) {
  const active = tabs.find((t) => t.id === activeId) || tabs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${DASH.warmPanel} ${className}`}
    >
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={activeId === tab.id ? DASH.activeTab : DASH.ghostTab}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={`mt-6 ${DASH.softInset}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
          Quick action
        </p>
        <p className="mt-1 text-lg font-bold text-[#12213E]">{active?.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          {active?.body}
        </p>
      </div>
      <button type="button" onClick={onAction} className={`mt-5 ${DASH.primaryBtnBlock}`}>
        {active?.cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
