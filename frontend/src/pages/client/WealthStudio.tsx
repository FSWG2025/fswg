import { useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import ClientToolShell from "@/components/client/ClientToolShell";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

const RANGES = [
  { id: "5Y", years: 5, label: "5Y" },
  { id: "10Y", years: 10, label: "10Y" },
  { id: "15Y", years: 15, label: "15Y" },
  { id: "20Y", years: 20, label: "20Y" },
  { id: "30Y", years: 30, label: "30Y" },
  { id: "custom", years: null, label: "Custom" },
] as const;

const money = (n: number) =>
  n.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });

function WealthTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const projected = Number(payload.find((p: any) => p.dataKey === "projected")?.value ?? 0);
  const contributed = Number(
    payload.find((p: any) => p.dataKey === "contributed")?.value ?? 0
  );
  const prevProjected = Number(payload[0]?.payload?.prevProjected ?? projected);
  const prevContributed = Number(payload[0]?.payload?.prevContributed ?? contributed);
  const pDelta =
    prevProjected > 0 ? ((projected - prevProjected) / prevProjected) * 100 : 0;
  const cDelta =
    prevContributed > 0
      ? ((contributed - prevContributed) / prevContributed) * 100
      : 0;

  return (
    <div className="min-w-[200px] rounded-2xl border border-[#E5EAF0] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(18,33,62,0.12)]">
      <p className="text-xs font-semibold text-[#6B7280]">{label}</p>
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-[#12213E]">
            <span className="h-3 w-0.5 rounded-full bg-[#C69259]" />
            Projected
          </span>
          <span className="tabular-nums font-bold text-[#12213E]">{money(projected)}</span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              pDelta >= 0 ? "bg-[#E8F5C8] text-[#3F6212]" : "bg-red-50 text-red-600"
            )}
          >
            {pDelta >= 0 ? "+" : ""}
            {pDelta.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-[#12213E]">
            <span className="h-3 w-0.5 rounded-full bg-[#12213E]" />
            Contributed
          </span>
          <span className="tabular-nums font-bold text-[#12213E]">
            {money(contributed)}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              cDelta >= 0 ? "bg-[#E8F5C8] text-[#3F6212]" : "bg-red-50 text-red-600"
            )}
          >
            {cDelta >= 0 ? "+" : ""}
            {cDelta.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WealthStudio() {
  const [monthly, setMonthly] = useState(250);
  const [customYears, setCustomYears] = useState(15);
  const [rate, setRate] = useState(6);
  const [start, setStart] = useState(1000);
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("15Y");

  const years =
    rangeId === "custom"
      ? customYears
      : RANGES.find((r) => r.id === rangeId)?.years || 15;

  const { future, contributedTotal, growthPct, chart } = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    let balance = start;
    let contributed = start;
    const points: {
      year: string;
      projected: number;
      contributed: number;
      prevProjected: number;
      prevContributed: number;
    }[] = [];

    let prevP = start;
    let prevC = start;
    points.push({
      year: "Now",
      projected: Math.round(balance),
      contributed: Math.round(contributed),
      prevProjected: Math.round(balance),
      prevContributed: Math.round(contributed),
    });

    for (let m = 1; m <= n; m++) {
      balance = balance * (1 + r) + monthly;
      contributed += monthly;
      if (m % 12 === 0 || m === n) {
        const yLabel = m === n ? `Y${years}` : `Y${m / 12}`;
        const p = Math.round(balance);
        const c = Math.round(contributed);
        points.push({
          year: yLabel,
          projected: p,
          contributed: c,
          prevProjected: prevP,
          prevContributed: prevC,
        });
        prevP = p;
        prevC = c;
      }
    }

    const totalContributed = start + monthly * n;
    const growth =
      totalContributed > 0
        ? ((balance - totalContributed) / totalContributed) * 100
        : 0;

    return {
      future: balance,
      contributedTotal: totalContributed,
      growthPct: growth,
      chart: points,
    };
  }, [monthly, years, rate, start]);

  return (
    <ClientToolShell
      eyebrow="In-app · 04"
      title="Wealth studio"
      description="Model savings growth inside your client hub. Illustrative only. Not investment advice."
      icon={Wallet}
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          {(
            [
              ["Starting amount", start, setStart, 0],
              ["Monthly contribution", monthly, setMonthly, 0],
              ["Annual rate %", rate, setRate, 0],
            ] as const
          ).map(([label, value, set, min]) => (
            <label
              key={label}
              className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280]"
            >
              {label}
              <input
                type="number"
                min={min}
                value={value}
                onChange={(e) => set(Number(e.target.value) || 0)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-1 py-3 text-sm font-semibold text-[#12213E] outline-none focus:border-[#C69259]"
              />
            </label>
          ))}
          {rangeId === "custom" && (
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Years
              <input
                type="number"
                min={1}
                max={50}
                value={customYears}
                onChange={(e) => setCustomYears(Number(e.target.value) || 1)}
                className="mt-2 w-full border-0 border-b border-[#E5EAF0] bg-transparent px-1 py-3 text-sm font-semibold text-[#12213E] outline-none focus:border-[#C69259]"
              />
            </label>
          )}
          <div className="rounded-2xl bg-[#12213E] p-4 text-white">
            <p className="text-xs text-white/60">Total contributed</p>
            <p className="mt-1 text-lg font-bold text-white/90">
              {money(contributedTotal)}
            </p>
            <p className="mt-3 text-xs text-white/60">Growth from returns</p>
            <p className="mt-1 text-sm font-semibold text-[#E8F5C8]">
              {money(Math.max(0, future - contributedTotal))}
            </p>
          </div>
        </div>

        {/* Chart card: reference-inspired layout */}
        <div className="rounded-2xl border border-[#E5EAF0] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_8px_24px_rgba(18,33,62,0.04)] sm:p-6 lg:col-span-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F3DFC7]">
                <Wallet className="h-4 w-4 text-[#12213E]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#12213E]">Projection</h2>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  <p className="text-3xl font-extrabold tracking-tight text-[#12213E] sm:text-4xl">
                    {money(future)}
                  </p>
                  <div className="pb-1">
                    <p className="text-xs text-[#6B7280]">
                      Over the next {years} year{years === 1 ? "" : "s"}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
                        growthPct >= 0
                          ? "bg-[#E8F5C8] text-[#3F6212]"
                          : "bg-red-50 text-red-600"
                      )}
                    >
                      {growthPct >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {growthPct >= 0 ? "+" : ""}
                      {growthPct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 rounded-full bg-[#F4F6F8] p-1">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRangeId(r.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    rangeId === r.id
                      ? "bg-white text-[#12213E] shadow-sm"
                      : "text-[#6B7280] hover:text-[#12213E]"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-4 text-xs font-medium text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-[#C69259]" />
              Projected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-[#12213E]" />
              Contributed
            </span>
          </div>

          <div className="mt-2 h-[300px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C69259" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#C69259" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="contribFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12213E" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#12213E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#E8EDF2" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                  width={42}
                />
                <Tooltip
                  content={<WealthTooltip />}
                  cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="none"
                  fill="url(#projFill)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="contributed"
                  stroke="none"
                  fill="url(#contribFill)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#C69259"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#C69259", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="contributed"
                  stroke="#12213E"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#12213E", stroke: "#fff", strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ClientToolShell>
  );
}
