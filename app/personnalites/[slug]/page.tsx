import Link from "next/link";
import { notFound } from "next/navigation";

import { FactCard, PersonalityCard, StatCard } from "@/components/ui";
import { getPersonalityPageData } from "@/lib/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PersonalityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPersonalityPageData(slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="detail-hero">
        <div className="card detail-main">
          <p className="eyebrow">{data.personality.role}</p>
          <h1>{data.personality.name}</h1>
          <p className="lead">{data.personality.summary}</p>
          <div className="mini-grid">
            <div>
              <strong>{data.personality.score}/100</strong>
              <span>fiabilite</span>
            </div>
            <div>
              <strong>{data.personality.factCount}</strong>
              <span>faits</span>
            </div>
            <div>
              <strong>{data.personality.totalVotes}</strong>
              <span>votes</span>
            </div>
          </div>
        </div>

        <div className="stack">
          <StatCard
            label="Lecture globale"
            value={data.personality.reliabilityLabel}
            hint="Calculee a partir des verdicts effectifs sur chaque fait."
          />
          <PersonalityCard personality={data.personality} />
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Faits suivis</p>
            <h2>Toutes les declarations suivies pour cette personnalite</h2>
          </div>
          <Link className="text-link" href="/faits">
            Revenir a tous les faits
          </Link>
        </div>
        <div className="cards-grid">
          {data.relatedFacts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>
    </main>
  );
}
