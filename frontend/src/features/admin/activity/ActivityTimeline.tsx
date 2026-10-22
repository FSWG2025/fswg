import { useMemo } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import {
  activitySentence,
  activityTone,
  dateGroupKey,
  dateGroupLabel,
  formatActivityLocation,
  formatExactDate,
  formatExactDateTime,
  formatExactTime,
  humanizeDetails,
  initials,
} from "./activityMeta";

export type ActivityLog = {
  _id?: string;
  action?: string;
  details?: string;
  createdAt?: string;
  date?: string;
  ipAddress?: string;
  userAgent?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  locationLabel?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  user?: { name?: string; email?: string; role?: string } | string;
};

type Props = {
  logs: ActivityLog[];
  compact?: boolean;
  onSelect?: (log: ActivityLog) => void;
  emptyLabel?: string;
};

type Group = { key: string; label: string; items: ActivityLog[] };

function groupLogs(logs: ActivityLog[]): Group[] {
  const map = new Map<string, Group>();
  for (const log of logs) {
    const iso = log.createdAt || log.date || new Date().toISOString();
    const key = dateGroupKey(iso);
    if (!map.has(key)) {
      map.set(key, { key, label: dateGroupLabel(iso), items: [] });
    }
    map.get(key)!.items.push(log);
  }
  return Array.from(map.values());
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-[9px] font-bold text-white ring-2 ring-white"
      title={name}
    >
      {initials(name)}
    </span>
  );
}

function TimelineEntry({
  log,
  compact,
  onSelect,
  isLast,
}: {
  log: ActivityLog;
  compact?: boolean;
  onSelect?: (log: ActivityLog) => void;
  isLast: boolean;
}) {
  const tone = activityTone(log.action || "");
  const Icon = tone.icon;
  const { actor, verb, object } = activitySentence(log);
  const iso = log.createdAt || log.date || "";
  const detailText = humanizeDetails(log.details, log.action);
  const location = formatActivityLocation(log);
  const showQuote =
    !compact &&
    !!detailText &&
    detailText.length > 12 &&
    detailText.toLowerCase() !== (log.action || "").toLowerCase();

  return (
    <li
      className={`relative flex gap-3 ${
        compact ? "pb-3 last:pb-0" : "gap-4 pb-7 last:pb-2 sm:gap-4"
      }`}
    >
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-[15px] top-8 bottom-0 w-px bg-[#E8ECF1]"
        />
      )}
      <span
        className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${tone.bg} ${tone.fg} shadow-sm`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <button
        type="button"
        onClick={() => onSelect?.(log)}
        className="min-w-0 flex-1 text-left"
      >
        <div
          className={`flex gap-2 ${
            compact
              ? "items-start justify-between"
              : "flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-3"
          }`}
        >
          <p className="min-w-0 text-[13px] leading-snug text-[#374151]">
            <span className="mr-1.5 inline-flex translate-y-0.5 align-middle">
              <Avatar name={actor} />
            </span>
            <span className="font-semibold text-[#111827]">{actor}</span>{" "}
            <span className="text-[#4B5563]">{verb.toLowerCase()}</span>
            {object && !compact ? (
              <>
                {" "}
                <span className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-[#F3F4F6] px-1.5 py-0.5 align-middle text-[12px] font-medium text-[#111827] sm:ml-0.5 sm:mt-0 sm:max-w-[220px]">
                  <span className="truncate">{object}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                </span>
              </>
            ) : null}
          </p>
          <time
            dateTime={iso || undefined}
            title={iso ? formatExactDateTime(iso) : undefined}
            className={`shrink-0 text-right tabular-nums text-[#9CA3AF] ${
              compact ? "pt-0.5 text-[10px]" : "text-[11px] sm:pt-0.5 sm:text-[12px]"
            }`}
          >
            {iso ? (
              compact ? (
                formatExactTime(iso)
              ) : (
                <>
                  <span className="block text-[#6B7280]">
                    {formatExactDate(iso)}
                  </span>
                  <span className="block font-medium text-[#4B5563]">
                    {formatExactTime(iso)}
                  </span>
                </>
              )
            ) : null}
          </time>
        </div>

        {showQuote && (
          <div className="mt-2.5 rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] px-3.5 py-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Details
            </p>
            <div className="border-l-2 border-[#C69259] pl-3">
              <p className="text-[13px] leading-relaxed text-[#4B5563]">
                {detailText}
              </p>
            </div>
          </div>
        )}

        {!compact && (location || log.ipAddress) && (
          <p className="mt-1.5 text-[11px] text-[#6B7280]">
            {location || "Location unavailable"}
            {log.ipAddress ? ` · IP ${log.ipAddress}` : ""}
            {typeof log.lat === "number" && typeof log.lng === "number"
              ? ` · ${log.lat.toFixed(4)}, ${log.lng.toFixed(4)}`
              : ""}
          </p>
        )}
      </button>
    </li>
  );
}

export default function ActivityTimeline({
  logs,
  compact = false,
  onSelect,
  emptyLabel = "No activity yet",
}: Props) {
  const groups = useMemo(() => groupLogs(logs), [logs]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F9FAFB] py-14 text-center">
        <p className="text-sm font-semibold text-[#111827]">{emptyLabel}</p>
        <p className="mt-1 text-xs text-[#6B7280]">
          Logins, logouts, and platform actions will show up here.
        </p>
      </div>
    );
  }

  // Compact dashboard feed: flat list, no date pills (those push the card taller).
  if (compact) {
    return (
      <ul className="relative">
        {logs.map((log, i) => (
          <TimelineEntry
            key={log._id || `c-${i}`}
            log={log}
            compact
            onSelect={onSelect}
            isLast={i === logs.length - 1}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="px-1 sm:px-2">
      {groups.map((group, gi) => (
        <motion.section
          key={group.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.04 }}
          className="relative"
        >
          <div className="relative z-[1] mb-5 h-7">
            <span className="absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-semibold text-[#6B7280] ring-4 ring-white">
              {group.label}
            </span>
          </div>
          <ul className="relative">
            {group.items.map((log, i) => (
              <TimelineEntry
                key={log._id || `${group.key}-${i}`}
                log={log}
                onSelect={onSelect}
                isLast={
                  i === group.items.length - 1 && gi === groups.length - 1
                }
              />
            ))}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}
