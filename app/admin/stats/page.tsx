import { AdminDashboard } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData, recordPageView } from "@/lib/store";

export default async function AdminStatsPage() {
  const session = await isAdminAuthenticated();
  if (!session) {
    return null;
  }

  await recordPageView("/admin/stats");
  const data = await getAdminDashboardData();

  return (
    <main className="page-shell stack-2xl">
      <AdminDashboard data={data} section="stats" />
    </main>
  );
}
