import { FindingsClient } from "@/components/dashboard/FindingsClient";
import { dataSource, getAllFindings, getRecentPRs } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FindingsPage() {
  const [findings, prs, source] = await Promise.all([
    getAllFindings(),
    getRecentPRs(),
    dataSource(),
  ]);
  return <FindingsClient findings={findings} prs={prs} dataSource={source} />;
}
