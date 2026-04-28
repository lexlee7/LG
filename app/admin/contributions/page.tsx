import { AdminContributionsView, AdminLoginForm } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminContributionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await isAdminAuthenticated();

  if (!session) {
    const errorParam = params.error;
    const error = Array.isArray(errorParam) ? errorParam[0] : errorParam;

    return (
      <main className="page-shell stack-2xl">
        <section className="section-block centered-section">
          <AdminLoginForm error={error} />
        </section>
      </main>
    );
  }

  await recordPageView("/admin/contributions");
  const data = await getAdminDashboardData();

  return (
      <main className="page-shell stack-2xl">
        <AdminContributionsView data={data} />
      </main>
  );
}
