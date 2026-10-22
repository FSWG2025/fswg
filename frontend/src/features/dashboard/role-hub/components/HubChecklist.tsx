import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { localStore } from "@/features/dashboard/shared/localStore";

type Props = {
  storageKey: string;
  userKey: string;
  items: { id: string; label: string }[];
};

export default function HubChecklist({ storageKey, userKey, items }: Props) {
  const key = `${storageKey}:${userKey}`;
  const [state, setState] = useState<Record<string, boolean>>(() =>
    localStore.get(key, {}),
  );

  useEffect(() => {
    localStore.set(key, state);
  }, [key, state]);

  const pct = Math.round(
    (items.filter((i) => state[i.id]).length / Math.max(items.length, 1)) * 100,
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold tabular-nums text-[#12213E]">{pct}%</span>
        <span className="text-[11px] font-semibold text-[#6B7280]">
          {items.filter((i) => state[i.id]).length}/{items.length} done
        </span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
        <motion.div
          className="h-full rounded-full bg-[#A3E635]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => {
          const done = !!state[item.id];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                  done ? "bg-[#F3F9E4]/70" : "hover:bg-[#F7FBFE]"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#65A30D]" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                )}
                <span
                  className={`text-sm ${
                    done
                      ? "font-medium text-[#12213E] line-through opacity-60"
                      : "text-[#334155]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
