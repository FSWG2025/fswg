import { motion } from "framer-motion";
import ConsultationInsightChart from "@/components/global/ConsultationInsightChart";
import LeadInterestsCurvyChart from "@/features/admin/funnel/LeadInterestsCurvyChart";
import { DASH } from "@/features/dashboard/shared/dashTokens";

type Props = {
  stats: Record<string, any>;
};

export default function AdminChartsColumn({ stats }: Props) {
  const hasTrend = Array.isArray(stats.consultationTrend) && stats.consultationTrend.length > 0;
  const hasInterests = Array.isArray(stats.leadInterests) && stats.leadInterests.length > 0;

  if (!hasTrend && !hasInterests) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={DASH.panel}
      >
        <p className={DASH.eyebrow}>Feature 03 · Insights</p>
        <h3 className={`mt-1 ${DASH.title}`}>Platform pulse</h3>
        <p className={`mt-1 ${DASH.body}`}>
          Consultation trends and lead interests will appear here once there is enough activity.
        </p>
        <div className="mt-5 flex h-[200px] items-center justify-center rounded-2xl bg-[#F7FBFE]">
          <p className="text-sm font-semibold text-[#6B7280]">Waiting for data</p>
        </div>
      </motion.section>
    );
  }

  return (
    <div className="space-y-4">
      {hasTrend && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl"
        >
          <ConsultationInsightChart
            data={stats.consultationTrend.map((item: any) => ({
              name: item._id,
              consultations: item.count,
              previous: item.previousCount,
            }))}
          />
        </motion.div>
      )}
      {hasInterests && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <LeadInterestsCurvyChart
            data={stats.leadInterests.map((item: any) => ({
              name: item._id,
              value: item.count,
            }))}
            height={260}
          />
        </motion.div>
      )}
    </div>
  );
}
