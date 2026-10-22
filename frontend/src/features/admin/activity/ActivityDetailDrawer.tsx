import { motion } from "framer-motion";
import { Clock, MapPin, Monitor, X } from "lucide-react";
import type { ActivityLog } from "./ActivityTimeline";
import {
  activityTone,
  formatActivityLocation,
  formatExactDateTime,
  humanizeDetails,
  initials,
} from "./activityMeta";

type Props = {
  log: ActivityLog | null;
  onClose: () => void;
};

export default function ActivityDetailDrawer({ log, onClose }: Props) {
  if (!log) return null;

  const tone = activityTone(log.action || "");
  const Icon = tone.icon;
  const name =
    (log.user as any)?.name ||
    (log.metadata?.system ? "System" : "Unknown");
  const when = log.createdAt
    ? formatExactDateTime(log.createdAt)
    : "-";
  const location = formatActivityLocation(log);
  const exact = humanizeDetails(log.details, log.action);
  const coords =
    typeof log.lat === "number" && typeof log.lng === "number"
      ? `${log.lat.toFixed(5)}, ${log.lng.toFixed(5)}`
      : log.metadata?.coordinates
        ? `${Number(log.metadata.coordinates.lat).toFixed(5)}, ${Number(log.metadata.coordinates.lng).toFixed(5)}`
        : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${tone.bg} ${tone.fg}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-lg font-bold text-[#111827]">{log.action}</p>
              <p className="text-xs text-[#6B7280]">{when}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F3F4F6] p-2 text-[#6B7280] hover:bg-[#E5E7EB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F9FAFB] p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-xs font-bold text-white">
              {initials(name)}
            </span>
            <div>
              <p className="font-semibold text-[#111827]">{name}</p>
              <p className="text-xs text-[#6B7280]">
                {(log.user as any)?.email || "N/A"}
                {(log.user as any)?.role
                  ? ` · ${(log.user as any).role}`
                  : ""}
              </p>
            </div>
          </div>

          {exact ? (
            <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Exactly what happened
              </p>
              <div className="border-l-2 border-[#C69259] pl-3">
                <p className="text-[13px] leading-relaxed text-[#111827]">
                  {exact}
                </p>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              When
            </p>
            <div className="flex items-start gap-2 text-[#111827]">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#C69259]" />
              <span className="text-[13px] font-medium leading-relaxed">
                {when}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#F3F4F6] bg-[#F9FAFB] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Exact location
            </p>
            <div className="flex items-start gap-2 text-[#111827]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C69259]" />
              <div className="min-w-0 space-y-1">
                <p className="text-[13px] font-medium leading-relaxed">
                  {location || "Location could not be resolved"}
                </p>
                {coords ? (
                  <p className="font-mono text-[11px] text-[#6B7280]">
                    Coordinates: {coords}
                  </p>
                ) : null}
                {log.ipAddress ? (
                  <p className="font-mono text-[11px] text-[#6B7280]">
                    IP: {log.ipAddress}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-[#6B7280]">
            <Monitor className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="break-all text-xs">{log.userAgent || "-"}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
