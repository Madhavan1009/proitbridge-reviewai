import { AnalyticsClient } from "@/components/dashboard/AnalyticsClient";
import { dataSource, getDashboardStats } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnalyticsPage() {
  const [stats, source] = await Promise.all([
    getDashboardStats(),
    dataSource(),
  ]);
  return <AnalyticsClient stats={stats} dataSource={source} />;
}
