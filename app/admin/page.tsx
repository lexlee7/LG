import { AdminDashboard, AdminLoginForm } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/store";

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
      <main className="page-shell">
        <section className="section-block centered-section">
          <AdminLoginForm error={error} />
        </section>
      </main>
    );
  }

  const data = await getAdminDashboardData();

  return (
    <main className="page-shell">
      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>Pilotage editorial et analytique</h1>
            <p className="muted">
              Veto sur les faits, mise en avant sur l accueil, creation de profils et
              supervision de l activite de vote.
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
