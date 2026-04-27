import Link from "next/link";
import { notFound } from "next/navigation";

import { FactCard, PersonalityCard } from "@/components/ui";
import { VotePanel } from "@/components/vote-panel";
import { formatDate } from "@/lib/format";
import { canVoteOnFact, getFactPageData } from "@/lib/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FactPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getFactPageData(slug);

  if (!data) {
    notFound();
  }

  const voteState = await canVoteOnFact(slug);

  return (
    <main className="page-shell">
      <section className="detail-grid">
        <div className="stack-xl">
          <article className="card detail-card">
            <div className="detail-header">
              <div>
                <p className="eyebrow">{data.fact.personality.name}</p>
                <h1>{data.fact.title}</h1>
              </div>
              <span className="score-pill">{data.fact.credibilityScore}%</span>
            </div>
            <p className="lead">{data.fact.statement}</p>
            <div className="meta-list">
              <span>{data.fact.category}</span>
              <span>{formatDate(data.fact.createdAt)}</span>
              <span>{data.fact.totalVotes} votes</span>
            </div>
            <div className="stack">
              <h3>Contexte</h3>
              <p>{data.fact.context}</p>
            </div>
            {data.fact.sourceUrl ? (
              <p>
                <a className="text-link" href={data.fact.sourceUrl} target="_blank" rel="noreferrer">
                  Source: {data.fact.sourceLabel ?? data.fact.sourceUrl}
                </a>
              </p>
            ) : (
              <p className="muted">Source: {data.fact.sourceLabel ?? "A renseigner"}</p>
            )}
          </article>

          <FactCard fact={data.fact} />

          <VotePanel fact={data.fact} blocked={!voteState.allowed} />
          {!voteState.allowed && voteState.reason ? (
            <p className="muted">{voteState.reason}</p>
          ) : null}
        </div>

        <aside className="stack-lg">
          <div className="card">
            <p className="eyebrow">Personnalite concernee</p>
            <PersonalityCard personality={data.personality} />
          </div>
          <div className="card">
            <div className="section-title">
              <h3>Autres faits lies</h3>
            </div>
            <div className="stack">
              {data.relatedFacts.map((fact) => (
                <Link key={fact.id} className="mini-link-card" href={`/faits/${fact.slug}`}>
                  <strong>{fact.title}</strong>
                  <span>{fact.totalVotes} votes</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
