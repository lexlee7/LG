import Link from "next/link";

import {
  FactCard,
  FeaturedCard,
  PersonCard,
  StatCard,
  VoteBar,
} from "@/components/ui";
import { formatCompactNumber } from "@/lib/format";
import { getHomepageData } from "@/lib/store";

export default async function Home() {
  const data = await getHomepageData();

  return (
    <main className="page-shell">
      <section className="hero-grid">
        <div className="card hero-card hero-card-main">
          <span className="eyebrow">Indice citoyen de fiabilite</span>
          <h1>Suivez les declarations publiques et la confiance qu elles inspirent.</h1>
          <p className="muted lead">
            Veridicte agrège les votes visiteurs sur chaque fait, puis permet a l
            administrateur d appliquer un veto editorial lorsque des preuves solides
            existent.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/personnalites">
              Explorer les personnalites
            </Link>
            <Link className="button button-secondary" href="/faits">
              Voir les faits en cours
            </Link>
          </div>
          <div className="hero-summary">
            <StatCard
              title="Personnalites"
              value={String(data.summary.totalPersonalities)}
              detail="Fiches comparees publiquement"
            />
            <StatCard
              title="Faits traces"
              value={String(data.summary.totalFacts)}
              detail="Promesses, bilans et affirmations"
            />
            <StatCard
              title="Votes"
              value={formatCompactNumber(data.summary.totalVotes)}
              detail={
                data.storageMode === "postgresql"
                  ? "Persistance active via PostgreSQL"
                  : "Mode demo en memoire"
              }
            />
          </div>
        </div>

        <div className="hero-stack">
          {data.featuredPersonality ? (
            <FeaturedCard
              title="Personnalite mise en avant"
              description={
                data.featuredPersonality.highlightNote ??
                "Un profil suivi de pres sur la fiabilite de ses declarations."
              }
            >
              <div className="stack">
                <div className="card-topline">
                  <div>
                    <h3>{data.featuredPersonality.name}</h3>
                    <p className="muted">{data.featuredPersonality.role}</p>
                  </div>
                  <span className="pill">{data.featuredPersonality.score}%</span>
                </div>
                <VoteBar
                  truePct={data.featuredPersonality.factVerdicts.true}
                  falsePct={data.featuredPersonality.factVerdicts.false}
                  unverifiablePct={data.featuredPersonality.factVerdicts.unverifiable}
                />
                <Link className="text-link" href={`/personnalites/${data.featuredPersonality.slug}`}>
                  Voir la fiche
                </Link>
              </div>
            </FeaturedCard>
          ) : null}

          {data.featuredFact ? (
            <FeaturedCard
              title="Fait mis en avant"
              description={
                data.featuredFact.highlightNote ??
                "Un fait chaud a suivre pour comprendre le debat public."
              }
            >
              <div className="stack">
                <div className="card-topline">
                  <div>
                    <h3>{data.featuredFact.title}</h3>
                    <p className="muted">{data.featuredFact.personality.name}</p>
                  </div>
                  <span className="pill">{data.featuredFact.totalVotes} votes</span>
                </div>
                <VoteBar
                  truePct={data.featuredFact.percentages.true}
                  falsePct={data.featuredFact.percentages.false}
                  unverifiablePct={data.featuredFact.percentages.unverifiable}
                />
                <Link className="text-link" href={`/faits/${data.featuredFact.slug}`}>
                  Consulter ce fait
                </Link>
              </div>
            </FeaturedCard>
          ) : null}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Classements</p>
            <h2>Les plus fiables du moment</h2>
          </div>
          <Link className="text-link" href="/personnalites">
            Voir toutes les personnalites
          </Link>
        </div>
        <div className="grid cards-grid">
          {data.mostReliable.map((person, index) => (
            <PersonCard key={person.id} person={person} rank={index + 1} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">On fire</p>
            <h2>Les faits les plus votes en ce moment</h2>
          </div>
          <Link className="text-link" href="/faits">
            Parcourir tous les faits
          </Link>
        </div>
        <div className="grid cards-grid">
          {data.onFireFacts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Zone de friction</p>
            <h2>Les personnalites les moins fiables</h2>
          </div>
        </div>
        <div className="grid cards-grid">
          {data.leastReliable.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </section>
    </main>
  );
}
