import { SearchFacts } from "@/components/ui";
import { getAdminDashboardData } from "@/lib/store";

export default async function FactsPage() {
  const data = await getAdminDashboardData();

  return (
    <main className="page-shell">
      <section className="section-intro">
        <p className="eyebrow">Base de faits</p>
        <h1>Tous les faits suivis par la plateforme</h1>
        <p className="muted">
          Recherchez un fait, observez sa repartition de votes et identifiez les sujets
          qui polarisent le debat.
        </p>
      </section>

      <SearchFacts facts={data.facts} />
    </main>
  );
}
