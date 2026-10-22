import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";

type Row = {
  name: string;
  email?: string;
  assigned: number;
  converted: number;
  consultations: number;
  rate: number;
};

type Props = { data: Row[] };

function statusFor(rate: number): { label: string; className: string } {
  if (rate >= 40)
    return { label: "Strong", className: "bg-[#ECFDF5] text-[#059669]" };
  if (rate >= 20)
    return { label: "Active", className: "bg-[#EFF6FF] text-[#2563EB]" };
  if (rate > 0)
    return { label: "Building", className: "bg-[#FFFBEB] text-[#D97706]" };
  return { label: "Idle", className: "bg-[#F3F4F6] text-[#6B7280]" };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function FunnelConsultantChart({ data }: Props) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.email || "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-[#E8ECF1] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_10px_28px_rgba(17,24,39,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-[#111827]">
            Team performance
          </h3>
          <p className="mt-1 text-xs text-[#6B7280]">
            You tracked {data.length} advisor
            {data.length === 1 ? "" : "s"} this cycle.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search advisors…"
              className="w-full rounded-xl border border-[#E8ECF1] bg-[#F9FAFB] py-2 pl-9 pr-3 text-xs text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:bg-white sm:w-52"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8ECF1] bg-white px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
          >
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 flex h-36 items-center justify-center rounded-2xl bg-[#F8FAFC] text-sm font-semibold text-[#6B7280]">
          No consultant performance data yet
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#F3F4F6] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                <th className="pb-3 pr-3 font-semibold">Advisor</th>
                <th className="pb-3 pr-3 font-semibold">Email</th>
                <th className="pb-3 pr-3 font-semibold">Assigned</th>
                <th className="pb-3 pr-3 font-semibold">Converted</th>
                <th className="pb-3 pr-3 font-semibold">Consults</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = statusFor(r.rate);
                return (
                  <tr
                    key={r.email || r.name}
                    className="border-b border-[#F8FAFC] last:border-0"
                  >
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#12213E] to-[#1E3A5F] text-[10px] font-bold text-white">
                          {initials(r.name)}
                        </span>
                        <span className="text-sm font-semibold text-[#111827]">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-sm text-[#6B7280]">
                      {r.email || "-"}
                    </td>
                    <td className="py-3.5 pr-3 text-sm font-semibold tabular-nums text-[#111827]">
                      {r.assigned}
                    </td>
                    <td className="py-3.5 pr-3 text-sm font-semibold tabular-nums text-[#111827]">
                      {r.converted}
                      <span className="ml-1 text-[11px] font-medium text-[#9CA3AF]">
                        ({r.rate}%)
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-sm font-semibold tabular-nums text-[#111827]">
                      {r.consultations}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
