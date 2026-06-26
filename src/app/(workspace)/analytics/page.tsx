import { AnalyticsPanel } from "@/components/analytics-panel";
import { MonitoringStatusCard } from "@/components/monitoring-status-card";
import { PageIntro } from "@/components/page-intro";
import { getAnalyticsPageData } from "@/lib/server/analytics";
import { getMonitoringOverview } from "@/lib/server/monitoring";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [analytics, monitoring] = await Promise.all([
    getAnalyticsPageData(),
    getMonitoringOverview(),
  ]);

  return (
    <div className="space-y-6">
      <PageIntro
        description="Track onboarding, wallet provider split, contract actions, feedback conversion, and monitoring/error visibility from one reviewer page."
        eyebrow="Analytics"
        title="Product and transaction telemetry"
      />
      <AnalyticsPanel {...analytics} />
      <MonitoringStatusCard overview={monitoring} />
    </div>
  );
}
