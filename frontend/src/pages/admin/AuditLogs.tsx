import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, LogIn, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import CustomPagination from "@/components/global/CustomPagination";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import ActivityToolbar from "@/features/admin/activity/ActivityToolbar";
import ActivityTimeline, {
  type ActivityLog,
} from "@/features/admin/activity/ActivityTimeline";
import ActivityDetailDrawer from "@/features/admin/activity/ActivityDetailDrawer";

interface AuditLogsProps {
  limit?: number;
}

const ACTION_FILTERS = [
  { id: "all", label: "All" },
  { id: "Logged In", label: "Logins" },
  { id: "Logged Out", label: "Logouts" },
  { id: "Signed Up", label: "Signups" },
  { id: "Lead", label: "Leads" },
  { id: "Rental", label: "Rentals" },
  { id: "Consultation", label: "Consults" },
] as const;

export default function AuditLogs({ limit }: AuditLogsProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [summary, setSummary] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      else {
        params.set("page", String(page));
        params.set("limit", "20");
      }
      if (filter !== "all") params.set("action", filter);

      const { data } = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(data.logs || []);
      setTotal(data.pagination?.total || data.logs?.length || 0);
      if (!limit) setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, filter]);

  useEffect(() => {
    if (limit) return;
    api
      .get("/audit-logs/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null));
  }, [limit]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...logs];
    if (q) {
      list = list.filter((log) => {
        const hay = [
          log.action,
          log.details,
          (log.user as any)?.name,
          (log.user as any)?.email,
          log.ipAddress,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    list.sort((a, b) => {
      const ta = new Date(a.createdAt || a.date || 0).getTime();
      const tb = new Date(b.createdAt || b.date || 0).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [logs, query, sort]);

  const loginCount =
    summary?.topActions?.find((a: any) => a.action === "Logged In")?.count || 0;
  const logoutCount =
    summary?.topActions?.find((a: any) => a.action === "Logged Out")?.count ||
    0;

  return (
    <DashboardShell>
      {!limit && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={DASH.panelHero}
        >
          <p className={DASH.eyebrowMuted}>Platform integrity</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E] sm:text-3xl">
            Activity log
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6B7280]">
            Every meaningful action on the web app: logins, logouts, CRM
            writes, rentals, and more.
          </p>
          <div className="mt-6">
            <SnapshotRail title="Last 30 days">
              <SnapshotCard
                index={0}
                label="Total events"
                value={summary?.totalLast30Days ?? total}
                sub="Audited mutations & auth"
                icon={Activity}
              />
              <SnapshotCard
                index={1}
                label="Auth events"
                value={
                  summary?.authEventsLast30Days ?? loginCount + logoutCount
                }
                sub="Login · logout · signup · password"
                icon={LogIn}
              />
              <SnapshotCard
                index={2}
                label="Logins"
                value={loginCount}
                sub="Successful sessions started"
                icon={LogIn}
              />
              <SnapshotCard
                index={3}
                label="Logouts"
                value={logoutCount}
                sub="Sessions ended cleanly"
                icon={LogOut}
              />
            </SnapshotRail>
          </div>
        </motion.div>
      )}

      {limit && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className={DASH.eyebrowMuted}>Live feed</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#12213E]">
            Recent activity
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Latest actions across the platform.
          </p>
        </motion.div>
      )}

      <ActivityToolbar
        query={query}
        onQueryChange={setQuery}
        filters={ACTION_FILTERS}
        activeFilter={filter}
        onFilterChange={(id) => {
          setPage(1);
          setFilter(id);
        }}
        sort={sort}
        onSortChange={setSort}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04),0_12px_32px_rgba(17,24,39,0.04)] sm:p-7"
      >
        {loading && visible.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#6B7280]">
            Loading activity…
          </p>
        ) : (
          <ActivityTimeline
            logs={visible}
            onSelect={setSelectedLog}
            emptyLabel="No activity yet"
          />
        )}

        {!limit && (
          <div className="mt-4 border-t border-[#F3F4F6] pt-4">
            <CustomPagination
              loading={loading}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </motion.div>

      <ActivityDetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </DashboardShell>
  );
}
