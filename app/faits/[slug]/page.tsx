import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot, FactCard, PersonalityCard } from "@/components/ui";
import { VotePanel } from "@/components/vote-panel";
import { formatDate } from "@/lib/format";
import { canVoteOnFact, getFactPageData, recordPageView } from "@/lib/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FactPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getFactPageData(slug);

  if (!data) {
    notFound();
  }

  await recordPageView(`/faits/${slug}`);
  const voteState = await canVoteOnFact(slug);

  return (
    <main className="page-shell stack-xl">
      <section className="feature-hero detail-layout">
        <div className="hero-copy-card hero-copy-card-wide">
          <span className="eyebrow">Detail d&apos;un fait</span>
          <h1>{data.fact.title}</h1>
          <p className="hero-description">{data.fact.statement}</p>
          <div className="hero-meta-row">
            <span className="soft-pill">{data.fact.category}</span>
            <span className="soft-pill">{formatDate(data.fact.happenedAt)}</span>
            <span className="soft-pill">{data.fact.totalVotes} votes</span>
            <span className="soft-pill">{data.fact.moderationStatus}</span>
          </div>
          <div className="article-shell">
            <h3>Contexte</h3>
            <p>{data.fact.context}</p>
          </div>
          {data.fact.sourceUrl ? (
            <a className="text-link" href={data.fact.sourceUrl} target="_blank" rel="noreferrer">
              Source : {data.fact.sourceLabel ?? data.fact.sourceUrl}
            </a>
          ) : (
            <p className="muted">Source : {data.fact.sourceLabel ?? "A renseigner"}</p>
          )}
        </div>

        <aside className="stack-lg">
          <PersonalityCard personality={data.personality} />
          <VotePanel fact={data.fact} availability={voteState} challenge={data.voteChallenge} />
        </aside>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Analyse collective</p>
            <h2>Lecture publique actuelle</h2>
          </div>
        </div>
        <FactCard fact={data.fact} />
      </section>

      <AdSlot label="Banniere article" size="banner" />

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Autour du meme profil</p>
            <h2>Autres faits lies</h2>
          </div>
          <Link className="text-link" href={`/personnalites/${data.personality.slug}`}>
            Voir la personnalite
          </Link>
        </div>
        <div className="cards-grid">
          {data.relatedFacts.map((fact) => (
            <FactCard key={fact.id} fact={fact} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
