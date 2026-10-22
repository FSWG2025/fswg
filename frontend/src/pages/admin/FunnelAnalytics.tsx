import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  CalendarCheck2,
  ChevronDown,
  Plus,
  Target,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import FunnelKpiCard from "@/features/admin/funnel/FunnelKpiCard";
import FunnelStageChart from "@/features/admin/funnel/FunnelStageChart";
import FunnelTrendChart from "@/features/admin/funnel/FunnelTrendChart";
import FunnelInterestChart from "@/features/admin/funnel/FunnelInterestChart";
import FunnelConsultantChart from "@/features/admin/funnel/FunnelConsultantChart";
import {
  ADVISOR_STAGE_COLORS,
  LEAD_STAGE_COLORS,
} from "@/features/admin/funnel/funnelColors";

function mergeMonthly(
  leads: { _id: string; count: number }[] = [],
  consults: { _id: string; count: number }[] = [],
) {
  const map = new Map<
    string,
    { name: string; leads: number; consultations: number }
  >();
  for (const row of leads) {
    map.set(row._id, { name: row._id, leads: row.count, consultations: 0 });
  }
  for (const row of consults) {
    const cur = map.get(row._id) || {
      name: row._id,
      leads: 0,
      consultations: 0,
    };
    cur.consultations = row.count;
    map.set(row._id, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** MoM % from last two monthly counts; null if not enough data. */
function momTrend(series: { count: number }[] = []): number | null {
  if (series.length < 2) return null;
  const sorted = [...series].sort((a: any, b: any) =>
    String(a._id || "").localeCompare(String(b._id || "")),
  );
  const prev = sorted[sorted.length - 2]?.count || 0;
  const curr = sorted[sorted.length - 1]?.count || 0;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

export default function FunnelAnalytics() {
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<any>({});
  const [sources, setSources] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [overview, src, perf] = await Promise.all([
          api.get("/funnel/overview"),
          api.get("/funnel/sources").catch(() => ({ data: [] })),
          api.get("/funnel/consultant-performance").catch(() => ({ data: [] })),
        ]);
        if (!alive) return;
        setFunnel(overview.data || {});
        setSources(Array.isArray(src.data) ? src.data : []);
        setPerformance(Array.isArray(perf.data) ? perf.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const leadStages = useMemo(
    () =>
      [
        { name: "New", value: funnel.leads?.new || 0 },
        { name: "Contacted", value: funnel.leads?.contacted || 0 },
        { name: "Qualified", value: funnel.leads?.qualified || 0 },
        { name: "Converted", value: funnel.leads?.converted || 0 },
        { name: "Closed", value: funnel.leads?.closed || 0 },
      ].map((s, i) => ({ ...s, fill: LEAD_STAGE_COLORS[i] })),
    [funnel],
  );

  const advisorStages = useMemo(
    () =>
      [
        { name: "Submitted", value: funnel.advisorApplications?.submitted || 0 },
        {
          name: "Under review",
          value: funnel.advisorApplications?.underReview || 0,
        },
        { name: "Approved", value: funnel.advisorApplications?.approved || 0 },
        { name: "Enrolled", value: funnel.advisorApplications?.enrolled || 0 },
        { name: "Rejected", value: funnel.advisorApplications?.rejected || 0 },
      ].map((s, i) => ({ ...s, fill: ADVISOR_STAGE_COLORS[i] })),
    [funnel],
  );

  const trends = useMemo(
    () =>
      mergeMonthly(
        funnel.leads?.monthlyTrend || [],
        funnel.consultations?.monthlyTrend || [],
      ),
    [funnel],
  );

  const interests = useMemo(
    () => [
      { name: "Insurance", value: funnel.interests?.insurance || 0 },
      { name: "Real estate", value: funnel.interests?.realEstate || 0 },
      { name: "Education", value: funnel.interests?.financialEducation || 0 },
      {
        name: "Entrepreneurship",
        value: funnel.interests?.entrepreneurship || 0,
      },
    ],
    [funnel],
  );

  const consultantRows = useMemo(
    () =>
      performance.map((p) => ({
        name: p.consultant?.name || "Advisor",
        email: p.consultant?.email,
        assigned: p.leadsAssigned || 0,
        converted: p.leadsConverted || 0,
        consultations: p.consultationsDone || 0,
        rate: p.conversionRate || 0,
      })),
    [performance],
  );

  const leadTrend = momTrend(funnel.leads?.monthlyTrend);
  const consultTrend = momTrend(funnel.consultations?.monthlyTrend);
  const heroMomentum = useMemo(() => {
    const last = trends[trends.length - 1];
    return (last?.leads || 0) + (last?.consultations || 0);
  }, [trends]);
  const heroTrend = useMemo(() => {
    if (trends.length < 2) return null;
    const a = trends[trends.length - 2];
    const b = trends[trends.length - 1];
    const prev = (a?.leads || 0) + (a?.consultations || 0);
    const curr = (b?.leads || 0) + (b?.consultations || 0);
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 1000) / 10;
  }, [trends]);

  const sourceList = sources.length
    ? sources
    : [{ _id: "website", count: funnel.leads?.total || 0 }];
  const sourceMax = Math.max(...sourceList.map((s: any) => s.count || 0), 1);

  if (loading) {
    return (
      <DashboardShell>
        <Skeleton className="h-12 w-72 rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-[20px]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-[22px] lg:col-span-2" />
          <Skeleton className="h-80 rounded-[22px]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-[28px]">
            Funnel analytics
            <span className="ml-1.5 font-semibold text-[#9CA3AF]">
              · This {period}
            </span>
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#6B7280]">
            Lead conversion, advisor recruitment, consultation momentum, and
            team performance: live from your First Step pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-xl border border-[#E8ECF1] bg-white py-2.5 pl-3.5 pr-9 text-sm font-semibold text-[#374151] shadow-[0_1px_2px_rgba(17,24,39,0.04)] outline-none"
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/leads")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.28)] transition hover:bg-[#2563EB]"
          >
            <Plus className="h-4 w-4" />
            Open leads
          </button>
        </div>
      </motion.div>

      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FunnelKpiCard
          index={0}
          label="Total leads"
          value={funnel.leads?.total || 0}
          trend={leadTrend}
          icon={Target}
          onDetails={() => navigate("/admin/leads")}
        />
        <FunnelKpiCard
          index={1}
          label="Conversion rate"
          value={`${funnel.leads?.conversionRate || 0}%`}
          trend={leadTrend}
          icon={TrendingUp}
          onDetails={() => navigate("/admin/leads")}
        />
        <FunnelKpiCard
          index={2}
          label="Advisor apps"
          value={funnel.advisorApplications?.total || 0}
          trend={null}
          icon={UserPlus}
          onDetails={() => navigate("/admin/advisor-applications")}
        />
        <FunnelKpiCard
          index={3}
          label="Consultations"
          value={funnel.consultations?.total || 0}
          trend={consultTrend}
          icon={CalendarCheck2}
          onDetails={() => navigate("/bookings")}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FunnelTrendChart
            data={trends}
            heroValue={heroMomentum.toLocaleString()}
            heroTrend={heroTrend}
          />
        </div>
        <FunnelInterestChart
          data={interests}
          conversionRate={funnel.leads?.conversionRate || 0}
        />
      </div>

      {/* Stage pipelines */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FunnelStageChart
          title="Lead conversion"
          body="How prospects move from new interest to converted clients."
          stages={leadStages}
          rateLabel="Conversion"
          rateValue={`${funnel.leads?.conversionRate || 0}%`}
        />
        <FunnelStageChart
          title="Advisor recruitment"
          body="Application pipeline from submit through enrollment."
          stages={advisorStages}
          rateLabel="Approval"
          rateValue={`${funnel.advisorApplications?.approvalRate || 0}%`}
        />
      </div>

      {/* Sources + brief */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[22px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_rgba(17,24,39,0.04)] sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Acquisition sources
            </h3>
            <p className="mt-1 text-xs text-[#6B7280]">
              Channels feeding the First Step lead pipeline.
            </p>
          </div>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sourceList.slice(0, 6).map((s: any, i: number) => {
            const label = String(s._id || "unknown").replace(/_/g, " ");
            return (
              <li key={label + i}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold capitalize text-[#111827]">
                    {label}
                  </span>
                  <span className="font-bold tabular-nums text-[#111827]">
                    {s.count || 0}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#F3F4F6]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#93C5FD]"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((s.count || 0) / sourceMax) * 100}%`,
                    }}
                    transition={{ delay: 0.04 * i, duration: 0.6 }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </motion.section>

      <FunnelConsultantChart data={consultantRows} />
    </DashboardShell>
  );
}
