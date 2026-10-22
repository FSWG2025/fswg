import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import ActivityTimeline, {
  type ActivityLog,
} from "@/features/admin/activity/ActivityTimeline";

type Props = {
  recentActivity: ActivityLog[];
  className?: string;
};

export default function AdminActivityFeed({
  recentActivity,
  className = "",
}: Props) {
  const pageSize = 5;
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(recentActivity.length / pageSize));

  useEffect(() => {
    setPage(0);
  }, [pageSize, recentActivity.length]);

  const pageIndex = Math.min(page, totalPages - 1);

  const slice = useMemo(() => {
    const start = pageIndex * pageSize;
    return recentActivity.slice(start, start + pageSize);
  }, [recentActivity, pageIndex, pageSize]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full min-w-0 flex-col rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.04)] sm:p-5 lg:self-start lg:p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-[#111827]">
            Recent activity
          </h3>
          <p className="mt-0.5 hidden text-xs text-[#6B7280] sm:block lg:hidden xl:block">
            Latest audit events
          </p>
        </div>
        {recentActivity.length > pageSize && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Previous activity page"
              disabled={pageIndex <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8ECF1] bg-white text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2.5rem] text-center text-[10px] font-semibold tabular-nums text-[#9CA3AF]">
              {pageIndex + 1}/{totalPages}
            </span>
            <button
              type="button"
              aria-label="Next activity page"
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8ECF1] bg-white text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <ActivityTimeline
          logs={slice}
          compact
          emptyLabel="No recent activity"
        />
      </div>

      <Link
        to="/dashboard/activity"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C69259] hover:underline"
      >
        View all <ArrowRight className="h-3 w-3" />
      </Link>
    </motion.section>
  );
}
