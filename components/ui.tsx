"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCompactNumber, formatDate, formatPercent } from "@/lib/format";
import type {
  AdminDashboardData,
  FactView,
  HomepageData,
  PersonalityView,
  Verdict,
} from "@/lib/types";

const verdictLabel: Record<Verdict, string> = {
  true: "Vrai",
  false: "Faux",
  unverifiable: "Inverifiable",
};

function verdictClass(verdict: Verdict) {
  if (verdict === "true") return "badge badge-true";
  if (verdict === "false") return "badge badge-false";
  return "badge badge-unverifiable";
}

export function TopNavigation() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">V</span>
        <span>Veridicte</span>
      </Link>
      <nav className="nav-links">
        <Link href="/personnalites">Personnalites</Link>
        <Link href="/faits">Faits</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <p>
        Veridicte permet d&apos;observer un consensus citoyen, sans remplacer un travail
        journalistique ni une verification documentaire approfondie.
      </p>
    </footer>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="card stat-card">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <p className="muted">{hint}</p>
    </article>
  );
}

export function FeaturedCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="card featured-card">
      <p className="eyebrow">{title}</p>
      <p className="muted">{description}</p>
      {children}
    </article>
  );
}

export function VoteBar({ fact }: { fact: FactView }) {
  return (
    <div className="vote-bar" aria-label="Repartition des votes">
      <div
        className="vote-segment vote-segment-true"
        style={{ width: `${fact.percentages.true}%` }}
      />
      <div
        className="vote-segment vote-segment-false"
        style={{ width: `${fact.percentages.false}%` }}
      />
      <div
        className="vote-segment vote-segment-unverifiable"
        style={{ width: `${fact.percentages.unverifiable}%` }}
      />
    </div>
  );
}

export function PersonalityCard({
  personality,
  showRank,
}: {
  personality: PersonalityView;
  showRank?: number;
}) {
  return (
    <article className="card personality-card">
      <div className="card-header-row">
        <div>
          <p className="eyebrow">{showRank ? `Top #${showRank}` : personality.role}</p>
          <h3>{personality.name}</h3>
        </div>
        <span className="score-pill">{personality.score}/100</span>
      </div>
      <p className="muted">{personality.summary}</p>
      <div className="vote-bar">
        <div className="vote-segment vote-segment-true" style={{ width: `${personality.score}%` }} />
        <div
          className="vote-segment vote-segment-false"
          style={{ width: `${Math.max(0, 100 - personality.score)}%` }}
        />
      </div>
      <div className="mini-grid">
        <div>
          <strong>{personality.factCount}</strong>
          <span>faits</span>
        </div>
        <div>
          <strong>{formatCompactNumber(personality.totalVotes)}</strong>
          <span>votes</span>
        </div>
      </div>
      <Link className="text-link" href={`/personnalites/${personality.slug}`}>
        Voir la fiche
      </Link>
    </article>
  );
}

export const PersonCard = PersonalityCard;

export function FactCard({
  fact,
  compact = false,
}: {
  fact: FactView;
  compact?: boolean;
}) {
  return (
    <article className={`card fact-card${compact ? " fact-card-compact" : ""}`}>
      <div className="card-header-row">
        <div>
          <p className="eyebrow">{fact.personality.name}</p>
          <h3>{fact.title}</h3>
        </div>
        <span className={verdictClass(fact.finalVerdict ?? "unverifiable")}>
          {verdictLabel[fact.finalVerdict ?? "unverifiable"]}
        </span>
      </div>
      <p>{fact.statement}</p>
      <p className="muted">
        {fact.category} · {fact.sourceLabel ?? "Source a renseigner"} · {formatDate(fact.createdAt)}
      </p>
      <VoteBar fact={fact} />
      <div className="mini-grid mini-grid-4">
        <div>
          <strong>{fact.totalVotes}</strong>
          <span>votes</span>
        </div>
        <div>
          <strong>{formatPercent(fact.percentages.true)}</strong>
          <span>vrai</span>
        </div>
        <div>
          <strong>{formatPercent(fact.percentages.false)}</strong>
          <span>faux</span>
        </div>
        <div>
          <strong>{formatPercent(fact.percentages.unverifiable)}</strong>
          <span>inv.</span>
        </div>
      </div>
      <div className="fact-footer">
        <Link className="text-link" href={`/faits/${fact.slug}`}>
          Detail du fait
        </Link>
        {fact.adminOverride ? <span className="pill-alert">Veto admin</span> : null}
      </div>
    </article>
  );
}

export function HomeHero({ data }: { data: HomepageData }) {
  return (
    <section className="hero-grid">
      <article className="hero-card hero-copy">
        <p className="eyebrow">Indice citoyen de fiabilite</p>
        <h1>Suivez les declarations publiques et leur niveau de credibilite.</h1>
        <p>
          Un site moderne, lisible sur mobile et desktop, qui combine vote visiteur,
          agrgation statistique et veto administrateur.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/personnalites">
            Explorer les personnalites
          </Link>
          <Link className="button button-secondary" href="/faits">
            Voir les faits on fire
          </Link>
        </div>
      </article>

      <article className="hero-card hero-highlight">
        <p className="eyebrow">Mis en avant</p>
        {data.featuredPersonality ? (
          <div className="stack">
            <span className="pill">Personnalite</span>
            <h3>{data.featuredPersonality.name}</h3>
            <p>{data.featuredPersonality.summary}</p>
            <Link className="text-link" href={`/personnalites/${data.featuredPersonality.slug}`}>
              Ouvrir la personnalite
            </Link>
          </div>
        ) : null}
        {data.featuredFact ? (
          <div className="stack hero-subcard">
            <span className="pill">Fait epingle</span>
            <h4>{data.featuredFact.title}</h4>
            <VoteBar fact={data.featuredFact} />
            <Link className="text-link" href={`/faits/${data.featuredFact.slug}`}>
              Voir le fait
            </Link>
          </div>
        ) : null}
      </article>
    </section>
  );
}

export function SearchFacts({
  facts,
}: {
  facts: FactView[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return facts;
    return facts.filter((fact) =>
      [fact.title, fact.statement, fact.personality.name, fact.category]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [facts, query]);

  return (
    <section className="stack-lg">
      <div className="search-box card">
        <label htmlFor="fact-search" className="eyebrow">
          Rechercher un fait ou une personnalite
        </label>
        <input
          id="fact-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex. dette, emploi, transports, ministre..."
        />
      </div>
      <div className="cards-grid">
        {filtered.map((fact) => (
          <FactCard key={fact.id} fact={fact} compact />
        ))}
      </div>
    </section>
  );
}

export function AdminLoginForm({ error }: { error?: string }) {
  return (
    <form className="card form-card" method="POST" action="/api/admin/login">
      <p className="eyebrow">Acces restreint</p>
      <h2>Connexion administrateur</h2>
      <label className="field">
        <span>Mot de passe</span>
        <input type="password" name="password" required />
      </label>
      <button className="button" type="submit">
        Se connecter
      </button>
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="stack-xl">
      <section className="stats-grid">
        <StatCard
          label="Mode de stockage"
          value={data.storageMode === "postgresql" ? "PostgreSQL" : "Demo"}
          hint="Production recommandee avec Render PostgreSQL"
        />
        <StatCard
          label="Votes"
          value={formatCompactNumber(data.summary.totalVotes)}
          hint="Nombre total de votes enregistres"
        />
        <StatCard
          label="Votants uniques"
          value={formatCompactNumber(data.summary.uniqueVoters)}
          hint="Estimation par empreinte anonyme"
        />
        <StatCard
          label="Personnalites"
          value={String(data.summary.totalPersonalities)}
          hint="Profils suivis sur la plateforme"
        />
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <div className="section-title">
            <h3>Faits les plus votes</h3>
          </div>
          <div className="table-list">
            {data.facts.slice(0, 8).map((fact) => (
              <div className="table-row" key={fact.id}>
                <div>
                  <strong>{fact.title}</strong>
                  <p className="muted">{fact.personality.name}</p>
                </div>
                <span>{fact.totalVotes} votes</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <div className="section-title">
            <h3>Derniers votes</h3>
          </div>
          <div className="table-list">
            {data.recentVotes.map((vote) => (
              <div className="table-row" key={vote.id}>
                <div>
                  <strong>{vote.factTitle}</strong>
                  <p className="muted">{vote.personalityName}</p>
                </div>
                <span>{verdictLabel[vote.verdict]}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="stack-lg">
        <div className="section-title">
          <h3>Gestion des mises en avant et vetos</h3>
        </div>
        <div className="dashboard-grid">
          <article className="card form-card">
            <p className="eyebrow">Nouvelle personnalite</p>
            <form className="stack-sm" method="POST" action="/api/admin/personality">
              <label className="field">
                <span>Nom</span>
                <input name="name" required placeholder="Ex. Camille Martin" />
              </label>
              <label className="field">
                <span>Role</span>
                <input name="role" required placeholder="Ex. Ministre de l'economie" />
              </label>
              <label className="field">
                <span>Resume</span>
                <textarea name="summary" required rows={4} />
              </label>
              <label className="field">
                <span>Accent couleur</span>
                <input name="accent" defaultValue="#6d5efc" required />
              </label>
              <label className="field">
                <span>Note de mise en avant</span>
                <textarea name="highlightNote" rows={3} />
              </label>
              <label className="checkbox-row">
                <input name="isFeatured" type="checkbox" value="true" />
                <span>Mettre en avant sur l'accueil</span>
              </label>
              <button className="button" type="submit">
                Ajouter la personnalite
              </button>
            </form>
          </article>

          <article className="card form-card">
            <p className="eyebrow">Nouveau fait</p>
            <form className="stack-sm" method="POST" action="/api/admin/fact">
              <label className="field">
                <span>Personnalite</span>
                <select name="personalitySlug" required defaultValue="">
                  <option value="" disabled>
                    Choisir une personnalite
                  </option>
                  {data.personalities.map((personality) => (
                    <option key={personality.id} value={personality.slug}>
                      {personality.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Titre</span>
                <input name="title" required />
              </label>
              <label className="field">
                <span>Affirmation resumee</span>
                <textarea name="statement" required rows={3} />
              </label>
              <label className="field">
                <span>Contexte</span>
                <textarea name="context" required rows={4} />
              </label>
              <label className="field">
                <span>Categorie</span>
                <input name="category" required placeholder="Ex. Fiscalite" />
              </label>
              <label className="field">
                <span>Label source</span>
                <input name="sourceLabel" />
              </label>
              <label className="field">
                <span>URL source</span>
                <input name="sourceUrl" type="url" />
              </label>
              <label className="field">
                <span>Note de mise en avant</span>
                <textarea name="highlightNote" rows={3} />
              </label>
              <label className="checkbox-row">
                <input name="isFeatured" type="checkbox" value="true" />
                <span>Mettre ce fait en avant</span>
              </label>
              <button className="button" type="submit">
                Ajouter le fait
              </button>
            </form>
          </article>
        </div>
        <div className="cards-grid">
          {data.facts.map((fact) => (
            <article className="card admin-fact-card" key={fact.id}>
              <h4>{fact.title}</h4>
              <p className="muted">{fact.personality.name}</p>
              <VoteBar fact={fact} />
              <form className="stack-sm" method="POST" action="/api/admin/override">
                <input type="hidden" name="factId" value={fact.id} />
                <label className="field">
                  <span>Veto admin</span>
                  <select name="outcome" defaultValue={fact.adminOverride ?? ""}>
                    <option value="">Pas de veto</option>
                    <option value="true">Vrai a 100%</option>
                    <option value="false">Faux a 100%</option>
                    <option value="unverifiable">Inverifiable a 100%</option>
                  </select>
                </label>
                <button className="button button-secondary" type="submit">
                  Sauvegarder le veto
                </button>
              </form>
              <form method="POST" action="/api/admin/feature" className="stack-sm">
                <input type="hidden" name="entityType" value="fact" />
                <input type="hidden" name="entityId" value={fact.id} />
                <input type="hidden" name="featured" value={fact.isFeatured ? "false" : "true"} />
                <button className="button button-secondary" type="submit">
                  {fact.isFeatured ? "Retirer de l'accueil" : "Mettre en avant"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-lg">
        <div className="section-title">
          <h3>Personnalites</h3>
        </div>
        <div className="cards-grid">
          {data.personalities.map((personality) => (
            <article className="card" key={personality.id}>
              <h4>{personality.name}</h4>
              <p className="muted">{personality.role}</p>
              <p>{personality.summary}</p>
              <form method="POST" action="/api/admin/feature" className="stack-sm">
                <input type="hidden" name="entityType" value="personality" />
                <input type="hidden" name="entityId" value={personality.id} />
                <input
                  type="hidden"
                  name="featured"
                  value={personality.isFeatured ? "false" : "true"}
                />
                <button className="button button-secondary" type="submit">
                  {personality.isFeatured ? "Retirer de l'accueil" : "Mettre en avant"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card">
          <div className="section-title">
            <h3>Ajouter une personnalite</h3>
          </div>
          <form className="stack-sm" method="POST" action="/api/admin/personality">
            <label className="field">
              <span>Nom</span>
              <input name="name" required placeholder="Ex. Camille Martin" />
            </label>
            <label className="field">
              <span>Role</span>
              <input name="role" required placeholder="Ex. Ministre de l'interieur" />
            </label>
            <label className="field">
              <span>Resume</span>
              <textarea
                name="summary"
                rows={4}
                required
                placeholder="Courte presentation de la personnalite..."
              />
            </label>
            <label className="field">
              <span>Accent couleur CSS</span>
              <input name="accent" defaultValue="#6366f1" required />
            </label>
            <button className="button" type="submit">
              Creer la personnalite
            </button>
          </form>
        </article>

        <article className="card">
          <div className="section-title">
            <h3>Ajouter un fait</h3>
          </div>
          <form className="stack-sm" method="POST" action="/api/admin/fact">
            <label className="field">
              <span>Personnalite</span>
              <select name="personalitySlug" required>
                {data.personalities.map((personality) => (
                  <option key={personality.id} value={personality.slug}>
                    {personality.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Titre</span>
              <input name="title" required placeholder="Formulation courte du fait" />
            </label>
            <label className="field">
              <span>Declaration</span>
              <textarea
                name="statement"
                rows={3}
                required
                placeholder="Citation ou promesse complete"
              />
            </label>
            <label className="field">
              <span>Contexte</span>
              <textarea
                name="context"
                rows={4}
                required
                placeholder="Quand, ou, dans quel cadre la declaration a ete faite"
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Categorie</span>
                <input name="category" required placeholder="Ex. Economie" />
              </label>
              <label className="field">
                <span>Source</span>
                <input name="sourceLabel" placeholder="Ex. Interview TV" />
              </label>
            </div>
            <label className="field">
              <span>URL source</span>
              <input name="sourceUrl" placeholder="https://..." />
            </label>
            <button className="button" type="submit">
              Creer le fait
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}
