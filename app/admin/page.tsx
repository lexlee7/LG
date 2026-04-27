import { AdminDashboard, AdminLoginForm } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: PageProps) {
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

  await recordPageView("/admin");
  const data = await getAdminDashboardData();

  return (
    <main className="page-shell stack-2xl">
      <section className="section-block stack-lg">
        <div className="section-header">
          <div>
            <p className="eyebrow">Centre de controle</p>
            <h1>Administration, moderation, imports et analytics</h1>
            <p className="muted lead">
              Suivez les votes, moderez les nouvelles contributions, importez en masse,
              corrigez vos profils en tableau et pilotez les contenus mis en avant.
            </p>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button className="button button-secondary" type="submit">
              Se deconnecter
            </button>
          </form>
        </div>
        <AdminDashboard data={data} />
      </section>
    </main>
  );
}
