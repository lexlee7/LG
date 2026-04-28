import { AdminLoginForm, AdminSubnav, SectionTitle } from "@/components/ui";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminDashboardData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLogsPage({ searchParams }: PageProps) {
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

  await recordPageView("/admin/logs");
  const data = await getAdminDashboardData();

  return (
    <main className="page-shell stack-2xl">
      <section className="section-block stack-lg">
        <div className="section-header">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>Logs d’administration</h1>
            <p className="muted lead">
              Historique compact des actions éditoriales et techniques récentes.
            </p>
          </div>
        </div>
        <AdminSubnav current="logs" />
        <section className="content-card">
          <SectionTitle
            kicker="Journal"
            title="Dernières actions"
            description="Suivez les validations, mises en avant, imports et opérations éditoriales."
          />
          <div className="table-list">
            {data.actionLogs.map((log) => (
              <div className="table-row" key={log.id}>
                <div>
                  <strong>{log.entityLabel}</strong>
                  <p className="muted">
                    {log.actionType} · {log.actorLabel}
                  </p>
                </div>
                <span>{log.createdAt.slice(0, 16).replace("T", " ")}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
