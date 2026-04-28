import {
  AdminDataManagement,
  AdminLoginForm,
  AdminSubnav,
} from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminDataPage({ searchParams }: PageProps) {
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

  await recordPageView("/admin/data");
  const data = await getAdminDashboardData();

  return (
    <main className="page-shell stack-2xl">
      <section className="section-block stack-lg">
        <div className="section-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>Données, imports et édition</h1>
            <p className="muted lead">
              Gérez les personnalités, les faits, les imports CSV et les modifications rapides.
            </p>
          </div>
        </div>
        <AdminSubnav current="data" />
        <AdminDataManagement data={data} />
      </section>
    </main>
  );
}
