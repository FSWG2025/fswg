import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  FileText,
  Plus,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ClientDashboardSearch from "@/components/dashboard/ClientDashboardSearch";
import { useLocationGreeting } from "@/hooks/useLocationGreeting";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import DashboardHero from "@/features/dashboard/shared/DashboardHero";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import JourneyMap from "@/features/dashboard/shared/JourneyMap";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import ClientFeaturePanels from "@/features/dashboard/client/ClientFeaturePanels";
import { useClientDashboardState } from "@/features/dashboard/client/useClientDashboardState";

type Props = {
  user: any;
  stats: any;
  onBook: () => void;
};

export default function ClientDashboard({ user, stats, onBook }: Props) {
  const { icon: TimeIcon, text: timeOfDay, timeZone } = useLocationGreeting();
  const s = useClientDashboardState(user, stats, onBook);
  const { navigate } = s;

  return (
    <DashboardShell>
      <DashboardHero
        eyebrow="Overview"
        greeting={`Good ${timeOfDay}, ${user?.name?.split(" ")[0] || "there"}`}
        TimeIcon={TimeIcon}
        subtitle={
          <>
            Your First Step hub for rentals, consultations, insurance, and wealth.
            <span className="sr-only"> Local time zone: {timeZone}.</span>
          </>
        }
        actions={
          <button type="button" onClick={onBook} className={DASH.primaryBtn}>
            <Plus className="h-4 w-4" />
            Book a Consultation
          </button>
        }
        search={<ClientDashboardSearch items={s.searchItems} />}
        snapshot={
          <SnapshotRail
            title="Client snapshot"
            action={
              <button
                type="button"
                onClick={() => navigate("/rental-applications")}
                className="text-sm font-semibold text-[#6B7280] transition hover:text-[#C69259]"
              >
                View all
              </button>
            }
          >
            {s.snapshotCards.map((card, i) => (
              <SnapshotCard
                key={card.key}
                index={i}
                label={card.label}
                value={card.value}
                sub={card.sub}
                icon={card.icon}
                wide={card.wide}
                onClick={card.onClick}
              />
            ))}
            <button
              type="button"
              onClick={() => navigate("/rental-applications/new")}
              className="flex min-h-[132px] min-w-0 flex-1 basis-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#12213E]/20 bg-white px-4 py-6 text-[#6B7280] transition hover:border-[#C69259]/50 hover:text-[#12213E] min-[420px]:basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.375rem)] lg:basis-[calc(33.333%-0.5rem)] xl:basis-[calc(25%-0.5625rem)]"
            >
              <Plus className="h-5 w-5" />
              <span className="mt-2 text-xs font-semibold">New app</span>
            </button>
          </SnapshotRail>
        }
      />

      <div className="space-y-5">
        <JourneyMap
          eyebrow="Feature 01 · Journey"
          title="Your First Step map"
          body="Track progress across consultations, rentals, insurance, wealth, and the network."
          steps={s.journey.map((step) => ({
            id: step.id,
            label: step.label,
            done: step.done,
            onClick: () => navigate(step.href),
          }))}
          columnsClassName="sm:grid-cols-5"
        />

        <div className="grid gap-4 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-5 ${DASH.warmPanel}`}
          >
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "book", label: "Book" },
                  { id: "rent", label: "Rent" },
                  { id: "insure", label: "Insure" },
                  { id: "wealth", label: "Wealth" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => s.setActionTab(tab.id)}
                  className={
                    s.actionTab === tab.id ? DASH.activeTab : DASH.ghostTab
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className={`mt-6 ${DASH.softInset}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                Quick action
              </p>
              <p className="mt-1 text-lg font-bold text-[#12213E]">
                {s.actionContent.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {s.actionContent.body}
              </p>
            </div>
            <button
              type="button"
              onClick={s.actionContent.run}
              className={`mt-5 ${DASH.primaryBtnBlock}`}
            >
              <ArrowLeftRight className="h-4 w-4" />
              {s.actionContent.cta}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-7 ${DASH.panel}`}
          >
            <h3 className={DASH.title}>Application progress</h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Status breakdown for your rental applications
            </p>
            <div className="mt-4 h-[220px]">
              {s.statusData.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#F7FBFE] text-center">
                  <FileText className="h-8 w-8 text-[#C69259]/60" />
                  <p className="mt-3 text-sm font-semibold text-[#12213E]">
                    No applications yet
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/rental-applications/new")}
                    className="mt-4 rounded-full bg-[#12213E] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Start application
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={s.statusData} barSize={28}>
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
                    <Bar
                      dataKey="count"
                      fill="#C9B6E8"
                      radius={[10, 10, 10, 10]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        <ClientFeaturePanels
          navigate={navigate}
          readinessItems={s.readinessItems}
          readiness={s.readiness}
          setReadiness={s.setReadiness}
          readinessPct={s.readinessPct}
          monthlySave={s.monthlySave}
          setMonthlySave={s.setMonthlySave}
          years={s.years}
          setYears={s.setYears}
          rate={s.rate}
          setRate={s.setRate}
          wealthFuture={s.wealthFuture}
          insuranceOptions={s.insuranceOptions}
          insurancePick={s.insurancePick}
          setInsurancePick={s.setInsurancePick}
          prepItems={s.prepItems}
          prep={s.prep}
          setPrep={s.setPrep}
          posts={s.posts}
          docItems={s.docItems}
          docs={s.docs}
          setDocs={s.setDocs}
          goalOptions={s.goalOptions}
          goals={s.goals}
          setGoals={s.setGoals}
          user={user}
          stats={stats}
          onBook={onBook}
          shareReferral={s.shareReferral}
          toggleList={s.toggleList}
          resources={s.resources}
        />
      </div>
    </DashboardShell>
  );
}
