import { useState } from "react";
import {
  ArrowDownWideNarrow,
  Filter,
  Search,
  X,
} from "lucide-react";

export type ActivityFilter = {
  id: string;
  label: string;
};

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  filters: readonly ActivityFilter[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  sort: "newest" | "oldest";
  onSortChange: (s: "newest" | "oldest") => void;
};

export default function ActivityToolbar({
  query,
  onQueryChange,
  filters,
  activeFilter,
  onFilterChange,
  sort,
  onSortChange,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search activity…"
            className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] shadow-[0_1px_2px_rgba(17,24,39,0.04)] outline-none placeholder:text-[#9CA3AF] focus:border-[#D1D5DB] focus:ring-2 focus:ring-[#12213E]/08"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() =>
              onSortChange(sort === "newest" ? "oldest" : "newest")
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition hover:bg-[#F9FAFB]"
          >
            <ArrowDownWideNarrow className="h-4 w-4 text-[#6B7280]" />
            Sort
            <span className="text-[11px] font-medium text-[#9CA3AF]">
              {sort === "newest" ? "Newest" : "Oldest"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition ${
              filtersOpen || activeFilter !== "all"
                ? "border-[#12213E] bg-[#12213E] text-white"
                : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilter !== "all" && (
              <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeFilter === f.id
                  ? "bg-[#12213E] text-white"
                  : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
              }`}
            >
              {f.label}
            </button>
          ))}
          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => onFilterChange("all")}
              className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
