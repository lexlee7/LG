import {
  FactsRail,
  HomeHero,
  PersonalityRail,
  SectionTitle,
  StatCard,
} from "@/components/ui";
import { formatCompactNumber } from "@/lib/format";
import { getHomepageData, recordPageView } from "@/lib/store";

export default async function HomePage() {
  await recordPageView("/");
  const data = await getHomepageData();

  return (
    <main className="page-shell page-stack">
      <HomeHero data={data} />

      <section className="stats-strip">
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

      <section className="portal-layout">
        <div className="portal-main">
          <SectionTitle
            kicker="Classement premium"
            title="Les personnalites les plus fiables"
            description="Un classement editorialise pour identifier rapidement les figures les plus credibles du moment."
            link={{ href: "/personnalites", label: "Tout voir" }}
          />
          <PersonalityRail personalities={data.mostReliable} ranked />

          <SectionTitle
            kicker="On fire"
            title="Les faits les plus votes"
            description="Les sujets qui mobilisent le plus la communaute en temps reel."
            link={{ href: "/faits", label: "Tous les faits" }}
          />
          <FactsRail facts={data.onFireFacts} />

          <SectionTitle
            kicker="Nouveaux contenus"
            title="Derniers faits ajoutes"
            description="Les nouvelles affirmations integrees dans la veille."
          />
          <FactsRail facts={data.latestFacts.slice(0, 4)} compact />
        </div>

        <aside className="portal-side">
          <div className="side-panel">
            <SectionTitle
              kicker="Sous surveillance"
              title="Les moins fiables"
              description="Les profils a surveiller de pres."
            />
            <PersonalityRail personalities={data.leastReliable} compact />
          </div>

          <div className="side-panel">
            <SectionTitle
              kicker="Zone grise"
              title="Les faits les plus controverses"
              description="Lignes de fracture entre vrai, faux et invérifiable."
            />
            <FactsRail facts={data.controversialFacts} compact />
          </div>
        </aside>
      </section>
    </main>
  );
}
