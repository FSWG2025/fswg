import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Download,
  FileText,
  Target,
  TrendingUp,
  Users,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/AuthProvider";
import { api } from "@/lib/api";
import { useLocationGreeting } from "@/hooks/useLocationGreeting";
import DataViewModal from "@/components/global/DataViewModal";
import ClientDashboardSearch from "@/components/dashboard/ClientDashboardSearch";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import DashboardHero from "@/features/dashboard/shared/DashboardHero";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import JourneyMap from "@/features/dashboard/shared/JourneyMap";
import QuickActionPanel from "@/features/dashboard/shared/QuickActionPanel";
import PriorityBanner from "@/features/dashboard/shared/PriorityBanner";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import { buildAdminSearchItems } from "./buildAdminSearchItems";
import AdminActivityFeed from "./AdminActivityFeed";
import AdminChartsColumn from "./AdminChartsColumn";

type Props = { stats: any; recentActivity?: any[] };

const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function AdminDashboard({
  stats,
  recentActivity = [],
}: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { icon: TimeIcon, text: timeOfDay, timeZone } = useLocationGreeting();
  const [showMore, setShowMore] = useState(false);
  const [actionTab, setActionTab] = useState("lead");
  const [dataModal, setDataModal] = useState<any>(null);

  const searchItems = useMemo(() => buildAdminSearchItems(stats || {}), [stats]);

  const handleExport = async () => {
    try {
      const res = await api.get("/users/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "users-export.csv";
      a.click();
      toast.success("Export downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const today = new Date();
  const dayNum = Number(
    new Intl.DateTimeFormat("en-US", { timeZone, day: "numeric" }).format(today),
  );
  const formattedDate = today.toLocaleDateString("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    year: "numeric",
  });
  const fullDate = `${getOrdinal(dayNum || today.getDate())} ${formattedDate}`;

  const quickActions = [
    {
      id: "lead",
      label: "Lead",
      title: "Capture a new lead",
      body: "Log a prospect from web, WhatsApp, or a referral and assign ownership.",
      cta: "New lead",
      href: "/admin/leads/new",
    },
    {
      id: "user",
      label: "User",
      title: "Add a client or teammate",
      body: "Create accounts with the right role so everyone lands in the correct hub.",
      cta: "Open users",
      href: "/admin/clients",
    },
    {
      id: "content",
      label: "Content",
      title: "Publish guidance",
      body: "Ship blog posts and education that feed the client Learning panel.",
      cta: "Open content",
      href: "/admin/content",
    },
    {
      id: "funnel",
      label: "Funnel",
      title: "Inspect conversion",
      body: "See how leads move from interest to consultation to client.",
      cta: "Open funnel",
      href: "/admin/funnel",
    },
    {
      id: "visitors",
      label: "Visitors",
      title: "Who clicked the site",
      body: "Cookie-tracked visitors, devices, pages, and linked accounts when they sign in.",
      cta: "Open visitors",
      href: "/admin/visitors",
    },
  ];

  const activeAction =
    quickActions.find((t) => t.id === actionTab) || quickActions[0];

  const journey = [
    {
      id: "leads",
      label: "Work leads",
      done: (stats.newLeads || 0) === 0 && (stats.totalClients || 0) > 0,
      onClick: () => navigate("/admin/leads"),
    },
    {
      id: "apps",
      label: "Clear rental queue",
      done: (stats.pendingApplications || 0) === 0,
      onClick: () => navigate("/admin/rental-applications"),
    },
    {
      id: "book",
      label: "Consultations",
      done: (stats.consultationsThisMonth || 0) > 0,
      onClick: () => navigate("/bookings"),
    },
    {
      id: "content",
      label: "Ship content",
      done: (stats.publishedContent || stats.contentCount || 0) > 0,
      onClick: () => navigate("/admin/content"),
    },
    {
      id: "funnel",
      label: "Review funnel",
      done: (stats.conversionRate || 0) > 0,
      onClick: () => navigate("/admin/funnel"),
    },
  ];

  const primarySnapshots = [
    {
      key: "clients",
      label: "Total clients",
      value: stats.totalClients || 0,
      sub: "Registered accounts",
      icon: Users,
      onClick: () =>
        setDataModal({
          title: "All Clients",
          endpoint: "/users?role=client&limit=100",
          columns: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone", render: (val: string) => val || "-" },
          ],
        }),
    },
    {
      key: "leads",
      label: "New leads",
      value: stats.newLeads || 0,
      sub: "Fresh pipeline · +12%",
      icon: Target,
      onClick: () => navigate("/admin/leads/new"),
    },
    {
      key: "apps",
      label: "Pending apps",
      value: stats.pendingApplications || 0,
      sub: "Rental guarantee queue",
      icon: FileText,
      onClick: () => navigate("/admin/rental-applications"),
    },
    {
      key: "conversion",
      label: "Conversion",
      value: `${stats.conversionRate || 0}%`,
      sub: "Lead → client rate",
      icon: TrendingUp,
      onClick: () => navigate("/admin/funnel"),
    },
  ];

  const moreSnapshots = [
    {
      key: "consults",
      label: "Consultations",
      value: stats.consultationsThisMonth || 0,
      sub: "This month",
      icon: Calendar,
      onClick: () => navigate("/bookings"),
    },
    {
      key: "advisors",
      label: "Active advisors",
      value: stats.activeAdvisors || 0,
      sub: "Consultants online",
      icon: Users,
      onClick: () =>
        setDataModal({
          title: "Active Advisors",
          endpoint: "/users?role=consultant&isActive=true&limit=100",
          columns: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            {
              key: "expertise",
              label: "Expertise",
              render: (val: string) => val || "-",
            },
          ],
        }),
    },
  ];

  const snapshots = showMore
    ? [...primarySnapshots, ...moreSnapshots]
    : primarySnapshots;

  return (
    <DashboardShell>
      <DashboardHero
        eyebrow="Admin overview"
        greeting={`Good ${timeOfDay}, ${user?.name?.split(" ")[0] || "Admin"}`}
        TimeIcon={TimeIcon}
        subtitle={
          <>
            {fullDate}
            <span className="sr-only"> Local time zone: {timeZone}.</span>
          </>
        }
        actions={
          <>
            {user?.role === "super_admin" && (
              <button
                type="button"
                onClick={() => navigate("/dashboard/super")}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C69259] bg-[#12213E] px-4 py-2.5 text-sm font-semibold text-[#C69259] transition hover:bg-[#0D1A2E]"
              >
                Escalate to Super
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8D5BC] bg-[#FBF4EB] px-4 py-2.5 text-sm font-semibold text-[#12213E] transition hover:border-[#C69259]/50"
            >
              <Download className="h-4 w-4 text-[#C69259]" />
              Export
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard/activity")}
              className={DASH.primaryBtn}
            >
              <Activity className="h-4 w-4" />
              Activity
            </button>
          </>
        }
        search={<ClientDashboardSearch items={searchItems} />}
        snapshot={
          <SnapshotRail
            title="Admin snapshot"
            action={
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="text-sm font-semibold text-[#6B7280] transition hover:text-[#C69259]"
              >
                {showMore ? "Show less" : "View all stats"}
              </button>
            }
          >
            {snapshots.map((card, i) => (
              <SnapshotCard
                key={card.key}
                index={i}
                label={card.label}
                value={card.value}
                sub={card.sub}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))}
          </SnapshotRail>
        }
      />

      {(stats.pendingApplications || 0) > 0 && (
        <PriorityBanner
          icon={Bell}
          title={`${stats.pendingApplications} pending rental application${
            stats.pendingApplications === 1 ? "" : "s"
          } need${stats.pendingApplications === 1 ? "s" : ""} review`}
          body="Clear the queue so newcomers are not waiting on documents or status."
          cta="Review queue"
          onClick={() => navigate("/admin/rental-applications")}
        />
      )}

      <div className="space-y-5">
        <JourneyMap
          title="Operations map"
          body="Keep the First Step machine moving: leads, rentals, consultations, content, and funnel health."
          steps={journey}
        />

        <div className="grid gap-4 lg:grid-cols-12">
          <QuickActionPanel
            tabs={quickActions}
            activeId={actionTab}
            onTabChange={setActionTab}
            onAction={() => navigate(activeAction.href)}
          />

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-7 ${DASH.panel}`}
          >
            <p className={DASH.eyebrow}>Feature 02 · Focus</p>
            <h3 className={`mt-1 ${DASH.title}`}>What needs you now</h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Priority lanes based on live platform stats
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                {
                  title: "Lead pipeline",
                  blurb: `${stats.newLeads || 0} new · open CRM`,
                  href: "/admin/leads",
                },
                {
                  title: "Rental queue",
                  blurb: `${stats.pendingApplications || 0} pending reviews`,
                  href: "/admin/rental-applications",
                },
                {
                  title: "Consultations",
                  blurb: `${stats.consultationsThisMonth || 0} this month`,
                  href: "/bookings",
                },
                {
                  title: "Funnel health",
                  blurb: `${stats.conversionRate || 0}% conversion`,
                  href: "/admin/funnel",
                },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="rounded-2xl border border-[#EEF2F6] bg-[#F7FBFE] p-3.5 text-left transition hover:-translate-y-0.5 hover:border-[#C69259]/40 hover:bg-white"
                >
                  <p className="text-sm font-bold text-[#12213E]">{item.title}</p>
                  <p className="mt-1 text-[11px] text-[#6B7280]">{item.blurb}</p>
                </button>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <AdminChartsColumn stats={stats} />
          </div>
          <AdminActivityFeed recentActivity={recentActivity} />
        </div>
      </div>

      <DataViewModal
        isOpen={!!dataModal}
        onClose={() => setDataModal(null)}
        title={dataModal?.title || ""}
        endpoint={dataModal?.endpoint || ""}
        columns={dataModal?.columns || []}
      />
    </DashboardShell>
  );
}
