import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { SUPER } from "@/features/super-admin/superTokens";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatExactDateTime } from "@/features/admin/activity/activityMeta";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Pulse = {
  status: string;
  sessions: {
    staffActive5m: number;
    staffActive15m: number;
    clientsActive15m: number;
  };
  traffic: { liveVisitors5m: number; uniqueVisitors15m: number };
  leads: { today: number; lastHour: number };
  rentals: Record<string, number>;
  consultations: { open: number; liveRooms: number };
  security: {
    failedSignals60m: number;
    errorSignals60m: number;
    botsBlockedToday: number;
  };
  queues: { approvalsPending: number };
  anomalies: {
    id: string;
    severity: string;
    title: string;
    why: string;
    href?: string;
  }[];
  staffHeartbeat: {
    id: string;
    name: string;
    role: string;
    lastActionAt?: string;
    idle?: boolean;
  }[];
  generatedAt: string;
};

type Snapshot = {
  t: string;
  visitors: number;
  leads: number;
  failed: number;
};

function healthScore(p: Pulse) {
  let score = 100;
  if (p.status === "DEGRADED") score -= 20;
  if (p.status === "MAINTENANCE") score -= 35;
  if (p.status === "LOCKDOWN") score -= 55;
  score -= Math.min(30, (p.security.failedSignals60m || 0) * 2);
  score -= Math.min(20, (p.security.botsBlockedToday || 0));
  score -= Math.min(15, (p.queues.approvalsPending || 0));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function PulsePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Pulse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const load = useCallback(() => {
    if (document.visibilityState === "hidden") return;
    Promise.all([
      api.get("/super/pulse"),
      api.get("/super/activity/stream", { params: { limit: 8 } }).catch(() => ({
        data: { events: [] },
      })),
    ])
      .then(([pulseRes, actRes]) => {
        const d = pulseRes.data as Pulse;
        setData(d);
        setEvents(actRes.data?.events || []);
        setError("");
        setHistory((prev) => {
          const next = [
            ...prev,
            {
              t: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              visitors: d.traffic?.liveVisitors5m ?? 0,
              leads: d.leads?.lastHour ?? 0,
              failed: d.security?.failedSignals60m ?? 0,
            },
          ];
          return next.slice(-14);
        });
      })
      .catch(() => setError("Could not load pulse"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const chartData = useMemo(() => {
    if (history.length >= 2) return history;
    if (!data) return [];
    // Single point: show a quiet baseline so the chart never looks broken
    return [
      {
        t: "now",
        visitors: data.traffic.liveVisitors5m,
        leads: data.leads.lastHour,
        failed: data.security.failedSignals60m,
      },
    ];
  }, [history, data]);

  if (loading && !data) {
    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-36 rounded-[18px]" />
            <Skeleton className="h-36 rounded-[18px]" />
          </div>
          <Skeleton className="h-72 rounded-[18px]" />
          <Skeleton className="h-56 rounded-[18px]" />
        </div>
        <Skeleton className="h-[520px] rounded-[18px]" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={SUPER.card}>
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={load} className={`mt-3 ${SUPER.primaryBtn}`}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const score = healthScore(data);
  const rentalTotal = Object.values(data.rentals || {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      {/* CENTER */}
      <div className="min-w-0 space-y-5">
        <motion.div
          custom={0}
          variants={fade}
          initial="hidden"
          animate="show"
          className="flex flex-wrap items-end justify-between gap-2"
        >
          <div>
            <p className={SUPER.eyebrow}>Mission control</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#12213E] sm:text-[28px]">
              Live Pulse
            </h1>
          </div>
          <p className="text-[11px] font-medium text-[#94A3B8]">
            Live · {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
        </motion.div>

        {/* Hero score cards (soft SaaS pattern) */}
        <motion.section custom={1} variants={fade} initial="hidden" animate="show">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#12213E]">Platform health</h2>
            <Link to="/dashboard/super/system" className={SUPER.ghostLink}>
              Kill switches →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/super/security")}
              className={cn(
                SUPER.card,
                "group text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(18,33,62,0.08)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#12213E]">
                    Ops integrity
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Composite of status, failed logins, bots, and queue depth.
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                    score >= 85
                      ? "bg-emerald-50 text-emerald-700"
                      : score >= 60
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700",
                  )}
                >
                  {data.status}
                </span>
              </div>
              <p
                className={cn(
                  "mt-5 text-5xl font-bold tabular-nums tracking-tight",
                  score >= 85
                    ? "text-emerald-600"
                    : score >= 60
                      ? "text-[#C69259]"
                      : "text-red-600",
                )}
              >
                {score}
              </p>
              <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                Health score · higher is safer
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/super/visitors")}
              className={cn(
                SUPER.card,
                "group text-left transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(18,33,62,0.08)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#12213E]">
                    Live traffic
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Unique visitors seen in the last 5 minutes across the site.
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#C69259] opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-5 text-5xl font-bold tabular-nums tracking-tight text-[#12213E]">
                {data.traffic.liveVisitors5m}
              </p>
              <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                {data.traffic.uniqueVisitors15m} unique · last 15m
              </p>
            </button>
          </div>
        </motion.section>

        {/* Trend analytics */}
        <section className={SUPER.card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#12213E]">
                Ops trend (live samples)
              </h2>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                Built from real Pulse polls while this page stays open.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#12213E]">
                <span className="h-2 w-2 rounded-full bg-[#12213E]" /> Visitors
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#C69259]">
                <span className="h-2 w-2 rounded-full bg-[#C69259]" /> Lead / hr
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Failed
              </span>
            </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="visFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12213E" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#12213E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C69259" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#C69259" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEF2F6" vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #E8ECF1",
                    boxShadow: "0 8px 24px rgba(18,33,62,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#12213E"
                  fill="url(#visFill)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#C69259"
                  fill="url(#leadFill)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="#F59E0B"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent activity list (documents pattern) */}
        <section className={SUPER.card}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#12213E]">
              Recent platform activity
            </h2>
            <Link to="/dashboard/super/omniscience" className={SUPER.ghostLink}>
              Omniscience →
            </Link>
          </div>
          {events.length === 0 ? (
            <p className={SUPER.body}>No audited events yet.</p>
          ) : (
            <ul className="divide-y divide-[#F1F5F9]">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F4F6F8] text-[#12213E]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#12213E]">
                      {ev.action}
                    </p>
                    <p className="truncate text-xs text-[#94A3B8]">
                      {ev.actor?.name || "system"}
                      {ev.details ? ` · ${ev.details}` : ""}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
                      {ev.at ? formatExactDateTime(ev.at) : "-"}
                      {ev.locationLabel
                        ? ` · ${ev.locationLabel}`
                        : ev.ip
                          ? ` · IP ${ev.ip}`
                          : ""}
                    </p>
                  </div>
                  <div className="hidden w-24 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F6]">
                      <div
                        className="h-full rounded-full bg-[#12213E]"
                        style={{
                          width: `${Math.min(100, 40 + (ev.action?.length || 0))}%`,
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* RIGHT RAIL */}
      <aside className="space-y-4">
        <section className={SUPER.card}>
          <h2 className="text-sm font-bold text-[#12213E]">Quick ops</h2>
          <ul className="mt-3 space-y-2">
            {[
              {
                label: "People control",
                hint: `${data.sessions.staffActive15m} staff · 15m`,
                to: "/dashboard/super/people",
                icon: Users,
                delta: "+live",
              },
              {
                label: "Security desk",
                hint: `${data.security.botsBlockedToday} bots today`,
                to: "/dashboard/super/security",
                icon: Shield,
                delta:
                  data.security.failedSignals60m > 0
                    ? `${data.security.failedSignals60m} fails`
                    : "clear",
              },
              {
                label: "Kill switches",
                hint: `Status ${data.status}`,
                to: "/dashboard/super/system",
                icon: Zap,
                delta: "armed",
              },
            ].map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-[#F4F6F8]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F6F8] text-[#12213E]">
                    <t.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#12213E]">
                      {t.label}
                    </span>
                    <span className="block text-xs text-[#94A3B8]">{t.hint}</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {t.delta}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={SUPER.card}>
          <h2 className="text-sm font-bold text-[#12213E]">Statistics</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Leads today", value: data.leads.today },
              { label: "Bookings", value: data.consultations.open },
              { label: "Rentals", value: rentalTotal },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-[#F4F6F8] px-2 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {s.label}
                </p>
                <p className="mt-1 text-xl font-bold tabular-nums text-[#12213E]">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-[#12213E]">
                {data.sessions.clientsActive15m}
              </p>
              <p className="text-[#94A3B8]">Clients 15m</p>
            </div>
            <div>
              <p className="font-bold text-[#12213E]">
                {data.queues.approvalsPending}
              </p>
              <p className="text-[#94A3B8]">Approvals</p>
            </div>
            <div>
              <p className="font-bold text-[#12213E]">
                {data.security.errorSignals60m}
              </p>
              <p className="text-[#94A3B8]">Errors 60m</p>
            </div>
          </div>
        </section>

        <section className={SUPER.card}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#12213E]">Attention</h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#12213E] px-1.5 text-[10px] font-bold text-white">
              {data.anomalies?.length || 0}
            </span>
          </div>
          {!data.anomalies?.length ? (
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              No anomalies above threshold. Systems look calm.
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.anomalies.slice(0, 4).map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-[#E8ECF1] bg-[#FBFBFC] p-3"
                >
                  <p className="text-sm font-semibold text-[#12213E]">{a.title}</p>
                  <p className="mt-1 text-xs text-[#6B7280] line-clamp-2">{a.why}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-[#C69259]">
                      {a.severity}
                    </span>
                    {a.href ? (
                      <Link to={a.href} className={SUPER.ghostLink}>
                        Open →
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={SUPER.card}>
          <h2 className="text-sm font-bold text-[#12213E]">Staff online</h2>
          {!data.staffHeartbeat?.length ? (
            <p className={`mt-3 ${SUPER.body}`}>Quiet hour for staff.</p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-2 overflow-auto">
              {data.staffHeartbeat.slice(0, 8).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate font-medium text-[#12213E]">
                    {s.name}
                  </span>
                  <span
                    className={
                      s.idle
                        ? "text-[11px] font-semibold text-amber-600"
                        : "text-[11px] font-semibold text-emerald-600"
                    }
                  >
                    {s.idle ? "Idle" : "Active"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
