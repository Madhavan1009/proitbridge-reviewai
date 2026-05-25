import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  dataSource,
  getAllFindings,
  getDashboardStats,
  getRecentPRs,
} from "@/lib/queries";

// Always fetch fresh on every request — dashboard is real-time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [prs, findings, stats, source] = await Promise.all([
    getRecentPRs(),
    getAllFindings(),
    getDashboardStats(),
    dataSource(),
  ]);

  return (
    <DashboardClient
      prs={prs}
      findings={findings}
      stats={stats}
      dataSource={source}
    />
  );
}
