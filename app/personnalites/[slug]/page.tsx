import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdSlot,
  FactCard,
  PersonalityCard,
  ReliabilityTimelineChart,
  SectionHeader,
  StatCard,
} from "@/components/ui";
import { recordPageView, getPersonalityPageData } from "@/lib/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PersonalityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPersonalityPageData(slug);

  if (!data) {
    notFound();
  }

  await recordPageView(`/personnalites/${slug}`);

  return (
    <main className="page-shell page-stack">
      <section className="detail-layout">
        <div className="stack-xl">
          <article className="hero-surface hero-person">
            <span className="eyebrow">Profil public</span>
            <h1>{data.personality.name}</h1>
            <p className="hero-subtitle">{data.personality.role}</p>
            <p className="hero-description">{data.personality.summary}</p>
            <div className="hero-meta-grid">
              <StatCard label="Fiabilite" value={`${data.personality.score}%`} hint={data.personality.reliabilityLabel} />
              <StatCard label="Faits" value={String(data.personality.factCount)} hint="Declarations suivies" />
              <StatCard label="Votes" value={String(data.personality.totalVotes)} hint="Participation cumulee" />
            </div>
          </article>

          <ReliabilityTimelineChart
            title="Evolution du taux de fiabilite"
            subtitle="Projection historique calculee sur les votes et vetos admin."
            points={data.personality.reliabilityHistory}
          />

          <AdSlot label="Banniere article personnalite" size="banner" />

          <section className="section-block">
            <SectionHeader
              title="Declarations suivies"
              subtitle="Tous les faits publics rattaches a cette personnalite."
              link={{ href: "/faits", label: "Voir toute la veille" }}
            />
            <div className="cards-grid cards-grid-2">
              {data.relatedFacts.map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </div>
          </section>
        </div>

        <aside className="stack-lg">
          <PersonalityCard personality={data.personality} />
          {data.personality.wikipediaUrl ? (
            <article className="card side-panel">
              <span className="eyebrow">Source externe</span>
              <h3>Wikipedia</h3>
              <p className="muted">Acceder a la fiche encyclopedique de reference.</p>
              <a
                className="button button-secondary"
                href={data.personality.wikipediaUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir Wikipedia
              </a>
            </article>
          ) : null}
          <article className="card side-panel">
            <span className="eyebrow">Navigation</span>
            <Link className="mini-link-card" href="/personnalites">
              <strong>Retour au classement</strong>
              <span>Toutes les personnalites</span>
            </Link>
            <Link className="mini-link-card" href="/faits">
              <strong>Explorer les faits</strong>
              <span>Filtres, recherche et pagination</span>
            </Link>
          </article>
        </aside>
      </section>
    </main>
  );
}
