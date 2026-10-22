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
import { FUNNEL_PALETTE } from "./funnelColors";

type Point = { name: string; leads: number; consultations: number };

type Props = {
  data: Point[];
  heroValue: string | number;
  heroTrend?: number | null;
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[#E8ECF1] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(17,24,39,0.12)]">
      <p className="text-[11px] font-semibold text-[#9CA3AF]">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.dataKey}
          className="mt-0.5 text-xs font-semibold"
          style={{ color: p.color }}
        >
          {p.name}:{" "}
          <span className="font-bold text-[#111827]">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function shortMonth(ym: string) {
  const m = ym.split("-")[1];
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const i = Number(m) - 1;
  return names[i] || ym;
}

export default function FunnelTrendChart({
  data,
  heroValue,
  heroTrend,
}: Props) {
  const chartData = data.map((d) => ({ ...d, name: shortMonth(d.name) }));
  const up = heroTrend == null ? null : heroTrend >= 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_rgba(17,24,39,0.04)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Performance overview
          </h3>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <p className="text-2xl font-extrabold tabular-nums text-[#111827] sm:text-3xl">
              {heroValue}
            </p>
            {heroTrend != null && (
              <span
                className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  up
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FEF2F2] text-[#DC2626]"
                }`}
              >
                {up ? "+" : ""}
                {heroTrend}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#6B7280]">
            Leads + consultations · last 6 months
          </p>
        </div>
        <span className="rounded-full border border-[#E8ECF1] bg-[#F9FAFB] px-3 py-1.5 text-[11px] font-semibold text-[#6B7280]">
          Last 6 months
        </span>
      </div>

      <div className="mt-4 h-[260px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm font-semibold text-[#6B7280]">
            Not enough trend data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="funnelPerfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={FUNNEL_PALETTE.blue}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="100%"
                    stopColor={FUNNEL_PALETTE.blue}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 6"
                stroke="#EEF2F6"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<Tip />} />
              <Area
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke={FUNNEL_PALETTE.blue}
                strokeWidth={2.5}
                fill="url(#funnelPerfGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: FUNNEL_PALETTE.blue,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="consultations"
                name="Consultations"
                stroke={FUNNEL_PALETTE.gold}
                strokeWidth={2}
                fill="transparent"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: FUNNEL_PALETTE.gold,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
}
