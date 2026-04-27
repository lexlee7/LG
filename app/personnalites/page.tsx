import { PersonalityCard } from "@/components/ui";
import { getHomepageData } from "@/lib/store";

export default async function PersonalitiesPage() {
  const data = await getHomepageData();

  return (
    <main className="page-shell">
      <section className="page-heading">
        <p className="eyebrow">Panorama public</p>
        <h1>Personnalites suivies</h1>
        <p className="muted lead">
          Comparez les profils selon leurs faits suivis, leur fiabilite moyenne et
          le volume de votes collectes.
        </p>
      </section>

      <section className="cards-grid">
        {data.allPersonalities.map((personality, index) => (
          <PersonalityCard key={personality.id} personality={personality} showRank={index + 1} />
        ))}
      </section>
    </main>
  );
}
