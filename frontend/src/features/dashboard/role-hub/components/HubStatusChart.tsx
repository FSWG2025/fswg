import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: { name: string; count: number }[];
  emptyLabel?: string;
  emptyCta?: string;
  onEmpty?: () => void;
};

export default function HubStatusChart({
  data,
  emptyLabel = "No data yet",
  emptyCta,
  onEmpty,
}: Props) {
  return (
    <div className="mt-4 h-[220px]">
      {data.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#F7FBFE] text-center">
          <BarChart3 className="h-8 w-8 text-[#C69259]/55" />
          <p className="mt-3 text-sm font-semibold text-[#12213E]">{emptyLabel}</p>
          {emptyCta && onEmpty && (
            <button
              type="button"
              onClick={onEmpty}
              className="mt-4 rounded-full bg-[#12213E] px-4 py-2 text-xs font-semibold text-white"
            >
              {emptyCta}
            </button>
          )}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#EEF2F6"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(18,33,62,0.04)" }}
              contentStyle={{
                borderRadius: 16,
                border: "none",
                boxShadow: "0 12px 30px rgba(18,33,62,0.12)",
              }}
            />
            <Bar dataKey="count" fill="#C9B6E8" radius={[10, 10, 10, 10]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
