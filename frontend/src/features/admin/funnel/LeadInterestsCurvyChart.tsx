import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/** FSWG-complementary palette: navy, gold, soft steel, warm cream, muted blue */
export const LEAD_INTEREST_COLORS = [
  "#12213E",
  "#C69259",
  "#6E93B5",
  "#D4A574",
  "#8FA3B8",
  "#E8D5BC",
];

type Slice = { name: string; value: number };

type Props = {
  title?: string;
  subtitle?: string;
  data: Slice[];
  height?: number;
  centerLabel?: string;
  centerValue?: string | number;
};

const Tip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-2xl border border-[#E8ECF1] bg-white px-3.5 py-2.5 shadow-[0_12px_32px_rgba(18,33,62,0.12)]">
      <p className="text-sm font-bold text-[#12213E]">{d.name}</p>
      <p className="text-xs text-[#6B7280]">
        {d.value} leads · {d.pct}%
      </p>
    </div>
  );
};

function formatInterestName(name: string) {
  return String(name || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function LeadInterestsCurvyChart({
  title = "Lead interests",
  subtitle = "Where new prospects want to start",
  data,
  height = 280,
  centerLabel = "Total",
  centerValue,
}: Props) {
  const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const empty = total === 0;
  const max = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  const chartData = data.map((d, i) => {
    const value = Number(d.value) || 0;
    return {
      name: formatInterestName(d.name),
      value,
      // Radial fill relative to max so arcs read clearly
      fillValue: value === 0 ? 0 : Math.max(18, Math.round((value / max) * 100)),
      pct: total ? Math.round((value / total) * 100) : 0,
      fill: LEAD_INTEREST_COLORS[i % LEAD_INTEREST_COLORS.length],
    };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(18,33,62,0.04),0_10px_28px_rgba(18,33,62,0.04)] sm:p-6"
    >
      <div>
        <h3 className="text-base font-bold text-[#12213E]">{title}</h3>
        <p className="mt-1 text-xs text-[#6B7280]">{subtitle}</p>
      </div>

      <div className="relative mx-auto mt-1 w-full" style={{ height }}>
        {empty ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-[#F7FBFE] text-sm font-semibold text-[#6B7280]">
            No interest data yet
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="28%"
                outerRadius="100%"
                barSize={14}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="#E8ECF1"
                  strokeDasharray="3 6"
                />
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="fillValue"
                  background={{ fill: "#F3F5F8" }}
                  cornerRadius={999}
                  isAnimationActive
                />
                <Tooltip content={<Tip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-extrabold tabular-nums text-[#12213E]">
                {centerValue ?? total}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C69259]">
                {centerLabel}
              </p>
            </div>
          </>
        )}
      </div>

      <ul className="mt-auto grid grid-cols-1 gap-2 border-t border-[#F3F4F6] pt-4 sm:grid-cols-2">
        {chartData.map((d) => (
          <li
            key={d.name}
            className="flex items-center justify-between gap-2 rounded-xl bg-[#F7FBFE] px-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 font-medium text-[#334155]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ background: d.fill }}
              />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-xs font-bold text-[#12213E]">
              {d.value}
              <span className="ml-1 font-medium text-[#9CA3AF]">{d.pct}%</span>
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
