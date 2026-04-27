import Link from "next/link";

import { FactCard, HomeHero, PersonalityCard, StatCard } from "@/components/ui";
import { formatCompactNumber } from "@/lib/format";
import { getHomepageData } from "@/lib/store";

export default async function Home() {
  const data = await getHomepageData();

  return (
    <main className="page-shell stack-xl">
      <HomeHero data={data} />

      <section className="stats-grid">
        <StatCard
          label="Personnalites"
          value={String(data.summary.totalPersonalities)}
          hint="Profils compares publiquement"
        />
        <StatCard
          label="Faits suivis"
          value={String(data.summary.totalFacts)}
          hint="Promesses, bilans et declarations"
        />
        <StatCard
          label="Votes"
          value={formatCompactNumber(data.summary.totalVotes)}
          hint={
            data.storageMode === "postgresql"
              ? "Persistance active via PostgreSQL"
              : "Mode demonstration en memoire"
          }
        />
        <StatCard
          label="Votants uniques"
          value={formatCompactNumber(data.summary.uniqueVoters)}
          hint="Estimation anonyme par empreinte visiteur"
        />
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Classement positif</p>
            <h2>Les personnalites les plus fiables</h2>
          </div>
          <Link className="text-link" href="/personnalites">
            Voir toutes les personnalites
          </Link>
        </div>
        <div className="cards-grid">
          {data.mostReliable.map((personality, index) => (
            <PersonalityCard
              key={personality.id}
              personality={personality}
              showRank={index + 1}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">On fire</p>
            <h2>Les faits les plus votes du moment</h2>
          </div>
          <Link className="text-link" href="/faits">
            Parcourir tous les faits
          </Link>
        </div>
        <div className="cards-grid">
          {data.onFireFacts.map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Sous surveillance</p>
            <h2>Les personnalites les moins fiables</h2>
          </div>
        </div>
        <div className="cards-grid">
          {data.leastReliable.map((personality) => (
            <PersonalityCard key={personality.id} personality={personality} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <p className="eyebrow">Derniers faits ajoutes</p>
            <h2>Ce que la plateforme observe en ce moment</h2>
          </div>
        </div>
        <div className="cards-grid">
          {(data.latestFacts ?? data.onFireFacts).slice(0, 3).map((fact) => (
            <FactCard key={fact.id} fact={fact} />
          ))}
        </div>
      </section>
    </main>
  );
}
