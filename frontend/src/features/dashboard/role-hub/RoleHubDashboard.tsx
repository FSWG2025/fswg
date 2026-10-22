import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import ClientDashboardSearch, {
  type DashboardSearchItem,
} from "@/components/dashboard/ClientDashboardSearch";
import { useLocationGreeting } from "@/hooks/useLocationGreeting";
import SnapshotCard from "@/features/dashboard/shared/SnapshotCard";
import DashboardShell from "@/features/dashboard/shared/DashboardShell";
import DashboardHero from "@/features/dashboard/shared/DashboardHero";
import SnapshotRail from "@/features/dashboard/shared/SnapshotRail";
import JourneyMap from "@/features/dashboard/shared/JourneyMap";
import QuickActionPanel from "@/features/dashboard/shared/QuickActionPanel";
import { DASH } from "@/features/dashboard/shared/dashTokens";
import {
  getRoleHubConfig,
  roleHubTitle,
} from "@/features/dashboard/role-hub/configs";
import HubFeaturePanel from "@/features/dashboard/role-hub/components/HubFeaturePanel";
import ResourceCenter from "@/features/dashboard/role-hub/components/ResourceCenter";
import HubStatusChart from "@/features/dashboard/role-hub/components/HubStatusChart";
import type { UserRole } from "@/lib/roles";

type Props = {
  user: any;
  stats: Record<string, any>;
  role: UserRole;
};

function formatStat(
  stats: Record<string, any>,
  key: string,
  format?: "number" | "percent" | "text",
) {
  const raw = stats[key];
  if (format === "text") return raw == null || raw === "" ? "-" : String(raw);
  if (format === "percent") return `${Number(raw) || 0}%`;
  if (typeof raw === "number") return raw;
  if (raw == null) return 0;
  return raw;
}

export default function RoleHubDashboard({ user, stats, role }: Props) {
  const navigate = useNavigate();
  const { icon: TimeIcon, text: timeOfDay, timeZone } = useLocationGreeting();
  const config = getRoleHubConfig(role);
  const [actionTab, setActionTab] = useState(
    config?.quickActions[0]?.id || "main",
  );

  useEffect(() => {
    if (config?.quickActions[0]?.id) setActionTab(config.quickActions[0].id);
  }, [config?.role]);

  const userKey = user?._id || user?.email || "guest";

  const searchItems = useMemo<DashboardSearchItem[]>(() => {
    if (!config) return [];
    return [
      ...config.snapshots.map((s) => ({
        id: `snap-${s.key}`,
        title: s.label,
        blurb: s.sub,
        category: "Overview",
        keywords: [s.label, s.sub, s.key],
        href: s.href,
        sectionId: "dash-snapshot",
      })),
      ...config.quickActions.map((a) => ({
        id: `qa-${a.id}`,
        title: a.title,
        blurb: a.body,
        category: "Action",
        keywords: [a.label, a.title, a.cta],
        href: a.href,
      })),
      ...config.resources.map((r, i) => ({
        id: `res-${i}`,
        title: r.title,
        blurb: r.blurb,
        category: "Tool",
        keywords: [r.title, r.blurb],
        href: r.href,
      })),
      ...config.features.map((f) => ({
        id: f.id,
        title: f.title,
        blurb: f.body,
        category: "Section",
        keywords: [f.eyebrow, f.title, f.body],
        sectionId: f.id,
      })),
      ...(config.searchExtras || []).map((e) => ({
        id: e.id,
        title: e.title,
        blurb: e.blurb,
        category: e.category,
        keywords: e.keywords,
        href: e.href,
        sectionId: e.sectionId,
      })),
      {
        id: "settings",
        title: "Account settings",
        blurb: "Update profile and password",
        category: "Account",
        keywords: ["settings", "profile", "password"],
        href: "/app/settings",
      },
    ];
  }, [config]);

  if (!config) {
    return (
      <div className="p-8 text-center text-sm text-[#6B7280]">
        No hub configured for role “{role}”.
      </div>
    );
  }

  const actionContent =
    config.quickActions.find((t) => t.id === actionTab) ||
    config.quickActions[0];

  const journey = config.journey.map((step) => ({
    id: step.id,
    label: step.label,
    done: step.doneWhen(stats),
    onClick: () => navigate(step.href),
  }));

  const chartFeature = config.features.find((f) => f.type === "chart");
  const otherFeatures = config.features.filter((f) => f.id !== chartFeature?.id);
  const snapshotHref = config.snapshots.find((s) => s.href)?.href;

  return (
    <DashboardShell>
      <DashboardHero
        eyebrow={`${roleHubTitle(role)} · role hub`}
        greeting={`Good ${timeOfDay}, ${user?.name?.split(" ")[0] || "there"}`}
        TimeIcon={TimeIcon}
        subtitle={
          <>
            <span className="mb-2 inline-flex rounded-full border border-[#E5EAF0] bg-[#F7FBFE] px-2.5 py-0.5 text-[11px] font-bold text-[#12213E]">
              {roleHubTitle(role)}
            </span>
            <span className="mt-1 block">{config.subtitle}</span>
            <span className="sr-only"> Local time zone: {timeZone}.</span>
          </>
        }
        actions={
          config.primaryCta ? (
            <button
              type="button"
              onClick={() => navigate(config.primaryCta!.href)}
              className={DASH.primaryBtn}
            >
              <Plus className="h-4 w-4" />
              {config.primaryCta.label}
            </button>
          ) : undefined
        }
        search={<ClientDashboardSearch items={searchItems} />}
        snapshot={
          <SnapshotRail
            title={`${roleHubTitle(role)} snapshot`}
            action={
              snapshotHref ? (
                <button
                  type="button"
                  onClick={() => navigate(snapshotHref)}
                  className="text-sm font-semibold text-[#6B7280] transition hover:text-[#C69259]"
                >
                  View all
                </button>
              ) : undefined
            }
          >
            {config.snapshots.map((card, i) => (
              <SnapshotCard
                key={card.key}
                index={i}
                label={card.label}
                value={formatStat(stats, card.statKey, card.format)}
                sub={card.sub}
                icon={card.icon}
                onClick={() => card.href && navigate(card.href)}
              />
            ))}
          </SnapshotRail>
        }
      />

      <div className="space-y-5">
        <JourneyMap
          title={`Your ${roleHubTitle(role)} map`}
          body={config.subtitle}
          steps={journey}
        />

        <div className="grid gap-4 lg:grid-cols-12">
          <QuickActionPanel
            tabs={config.quickActions}
            activeId={actionTab}
            onTabChange={setActionTab}
            onAction={() =>
              actionContent?.href && navigate(actionContent.href)
            }
          />

          {chartFeature?.chartStatKey ? (
            <motion.div
              id={chartFeature.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`scroll-mt-24 lg:col-span-7 ${DASH.panel}`}
            >
              <p className={DASH.eyebrow}>{chartFeature.eyebrow}</p>
              <h3 className={`mt-1 ${DASH.title}`}>{chartFeature.title}</h3>
              <p className={`mt-0.5 text-xs text-[#6B7280]`}>{chartFeature.body}</p>
              <HubStatusChart
                data={(stats[chartFeature.chartStatKey] || []).map(
                  (item: any) => ({
                    name: String(item._id || item.name || "unknown").replace(
                      /_/g,
                      " ",
                    ),
                    count: item.count || 0,
                  }),
                )}
              />
            </motion.div>
          ) : (
            <ResourceCenter
              body={`Tools scoped to the ${roleHubTitle(role)} role`}
              resources={config.resources}
            />
          )}
        </div>

        {chartFeature ? (
          <ResourceCenter
            body={`Tools scoped to the ${roleHubTitle(role)} role`}
            resources={config.resources}
            className=""
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {otherFeatures.map((feature, i) => {
            const isOddLast =
              otherFeatures.length % 2 === 1 && i === otherFeatures.length - 1;
            return (
              <HubFeaturePanel
                key={feature.id}
                feature={feature}
                stats={stats}
                role={role}
                userKey={userKey}
                index={i}
                className={isOddLast ? "lg:col-span-2" : undefined}
                wide={isOddLast}
              />
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
