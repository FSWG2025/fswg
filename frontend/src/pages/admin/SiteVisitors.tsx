import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Globe2,
  Loader2,
  Monitor,
  Search,
  Smartphone,
  Tablet,
  UserCircle2,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import { DASH } from "@/features/dashboard/shared/dashTokens";

type Visitor = {
  _id: string;
  visitorId: string;
  ip?: string;
  browser?: string;
  os?: string;
  device?: "mobile" | "desktop" | "tablet" | "unknown";
  language?: string;
  timezone?: string;
  screen?: string;
  referrer?: string;
  landingPage?: string;
  lastPath?: string;
  paths?: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  city?: string;
  visitCount?: number;
  pageViews?: number;
  firstSeenAt?: string;
  lastSeenAt?: string;
  linkedEmail?: string;
  linkedName?: string;
  linkedUser?: { name?: string; email?: string; role?: string } | null;
};

type Stats = {
  total: number;
  activeToday: number;
  activeWeek: number;
  identified: number;
  pageViews: number;
};

function formatWhen(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

function DeviceIcon({ device }: { device?: Visitor["device"] }) {
  if (device === "mobile") return <Smartphone className="h-4 w-4" />;
  if (device === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

export default function SiteVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get("/visitors", { params: { page, limit: 40, q: q || undefined } }),
        api.get("/visitors/stats").catch(() => ({ data: null })),
      ]);
      setVisitors(Array.isArray(listRes.data?.visitors) ? listRes.data.visitors : []);
      setPages(listRes.data?.pages || 1);
      setTotal(listRes.data?.total || 0);
      if (statsRes.data) setStats(statsRes.data);
    } catch {
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 280 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <DashboardShell>
      <div className="space-y-5">
        <div className="min-w-0">
          <p className={DASH.eyebrow}>Traffic intelligence</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-[#12213E] sm:text-2xl">
            Site visitors
          </h1>
          <p
            className={`mt-2 max-w-prose text-[13px] leading-relaxed text-[#6B7280] sm:text-sm md:max-w-2xl`}
          >
            Everyone who opens the site gets a private visitor cookie. We store
            device, location signals, and pages viewed. When they sign in or
            submit a lead, we attach their account details.
          </p>
        </div>

        <SnapshotRail>
          <SnapshotCard
            label="Unique visitors"
            value={stats?.total ?? "-"}
            sub="All time"
            icon={Users}
            index={0}
          />
          <SnapshotCard
            label="Active today"
            value={stats?.activeToday ?? "-"}
            sub="Last 24 hours"
            icon={Eye}
            index={1}
          />
          <SnapshotCard
            label="This week"
            value={stats?.activeWeek ?? "-"}
            sub="Last 7 days"
            icon={Globe2}
            index={2}
          />
          <SnapshotCard
            label="Identified"
            value={stats?.identified ?? "-"}
            sub="Linked to a name or email"
            icon={UserCircle2}
            index={3}
          />
        </SnapshotRail>

        <div className={DASH.panel}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={DASH.title}>Recent clicks</h2>
              <p className={DASH.body}>
                {total} visitor{total === 1 ? "" : "s"} tracked
              </p>
            </div>
            <label className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Search email, IP, path…"
                className="w-full rounded-xl border border-[#E5EAF0] bg-[#F7FBFE] py-2.5 pl-9 pr-3 text-sm text-[#12213E] outline-none focus:border-[#C69259]/50 focus:ring-2 focus:ring-[#C69259]/15"
              />
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6B7280]">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading visitors…
            </div>
          ) : visitors.length === 0 ? (
            <div className="rounded-2xl bg-[#F7FBFE] px-5 py-12 text-center">
              <p className="font-semibold text-[#12213E]">No visitors yet</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                Open the public site in another tab: new clicks appear here
                automatically.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-[#EEF2F6]">
              {visitors.map((v) => {
                const name =
                  v.linkedName ||
                  v.linkedUser?.name ||
                  (v.linkedEmail ? v.linkedEmail.split("@")[0] : null);
                const email = v.linkedEmail || v.linkedUser?.email;
                return (
                  <li
                    key={v._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#12213E] text-white">
                          <DeviceIcon device={v.device} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#12213E]">
                            {name || "Anonymous visitor"}
                          </p>
                          <p className="truncate text-xs text-[#6B7280]">
                            {email || `ID · ${v.visitorId.slice(0, 8)}…`}
                          </p>
                        </div>
                        {email && (
                          <span className="rounded-full bg-[#E8F5C8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3F6212]">
                            Identified
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                        <span>
                          {v.browser || "-"} · {v.os || "-"} · {v.device || "-"}
                        </span>
                        {v.ip && <span>IP {v.ip}</span>}
                        {(v.city || v.country) && (
                          <span>
                            {[v.city, v.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {v.timezone && <span>{v.timezone}</span>}
                      </div>
                      <p className="mt-1.5 text-xs text-[#475569]">
                        Last page:{" "}
                        <span className="font-medium text-[#12213E]">
                          {v.lastPath || "-"}
                        </span>
                        {v.landingPage && v.landingPage !== v.lastPath && (
                          <>
                            {" "}
                            · Landed on{" "}
                            <span className="font-medium">{v.landingPage}</span>
                          </>
                        )}
                      </p>
                      {v.referrer && (
                        <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
                          From: {v.referrer}
                        </p>
                      )}
                      {(v.utmSource || v.utmCampaign) && (
                        <p className="mt-0.5 text-[11px] text-[#C69259]">
                          UTM {[v.utmSource, v.utmMedium, v.utmCampaign]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-left text-xs text-[#6B7280] sm:text-right">
                      <p className="font-semibold text-[#12213E]">
                        {v.pageViews || 0} views · {v.visitCount || 1} visits
                      </p>
                      <p className="mt-1">Last seen {formatWhen(v.lastSeenAt)}</p>
                      <p>First seen {formatWhen(v.firstSeenAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {pages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-[#EEF2F6] pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-[#E5EAF0] px-4 py-2 text-sm font-semibold text-[#12213E] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-[#6B7280]">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-full border border-[#E5EAF0] px-4 py-2 text-sm font-semibold text-[#12213E] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
