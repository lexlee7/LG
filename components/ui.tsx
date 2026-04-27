"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCompactNumber, formatDate, formatPercent } from "@/lib/format";
import type {
  AdminActionLogView,
  AdminDashboardData,
  FactsListingData,
  FactView,
  HomepageData,
  PersonalityView,
  PersonalitiesListingData,
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

function moderationLabel(status: FactView["moderationStatus"]) {
  if (status === "approved") return "Approuve";
  if (status === "pending") return "En attente";
  if (status === "rejected") return "Rejete";
  return "Brouillon";
}

export function TopNavigation() {
  return (
    <header className="portal-header">
      <div className="portal-header__inner">
        <Link className="brand" href="/">
          <span className="brand-mark">V</span>
          <div className="brand-copy">
            <span>Veridicte</span>
            <small>Trust portal</small>
          </div>
        </Link>

        <nav className="portal-nav">
          <Link href="/">Accueil</Link>
          <Link href="/personnalites">Personnalites</Link>
          <Link href="/faits">Faits</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="portal-footer">
      <div className="portal-footer__inner">
        <div>
          <strong>Veridicte</strong>
          <p>
            Le consensus citoyen, les sources et l&apos;arbitrage editorial sont rendus
            lisibles dans une interface claire sur desktop et mobile.
          </p>
        </div>
        <div className="footer-tags">
          <span>Vote anonyme limite</span>
          <span>Moderation admin</span>
          <span>PostgreSQL ready</span>
        </div>
      </div>
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
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  );
}

export function SectionTitle({
  kicker,
  title,
  description,
  link,
}: {
  kicker: string;
  title: string;
  description: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
        <p className="muted">{description}</p>
      </div>
      {link ? (
        <Link className="text-link" href={link.href}>
          {link.label}
        </Link>
      ) : null}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  kicker = "Observation publique",
  description,
  link,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  description?: string;
  link?: { href: string; label: string };
}) {
  return (
    <SectionTitle
      kicker={kicker}
      title={title}
      description={description ?? subtitle ?? ""}
      link={link}
    />
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
    <article className="content-card personality-card">
      <div className="content-card__top">
        <div className="identity-strip">
          <span className="identity-strip__avatar" style={{ background: personality.accent }} />
          <div>
            <p className="eyebrow">{showRank ? `Classement #${showRank}` : personality.role}</p>
            <h3>{personality.name}</h3>
          </div>
        </div>
        <span className="score-pill">{personality.score}/100</span>
      </div>

      <p className="muted">{personality.summary}</p>

      <div className="meta-tags">
        <span>{personality.country}</span>
        {personality.party ? <span>{personality.party}</span> : <span>Sans parti</span>}
        <span>{personality.reliabilityLabel}</span>
      </div>

      <div className="vote-bar">
        <div className="vote-segment vote-segment-true" style={{ width: `${personality.score}%` }} />
        <div
          className="vote-segment vote-segment-false"
          style={{ width: `${Math.max(0, 100 - personality.score)}%` }}
        />
      </div>

      <div className="info-grid">
        <div>
          <strong>{personality.factCount}</strong>
          <span>faits</span>
        </div>
        <div>
          <strong>{formatCompactNumber(personality.totalVotes)}</strong>
          <span>votes</span>
        </div>
      </div>

      <div className="card-actions">
        <Link className="button button-secondary" href={`/personnalites/${personality.slug}`}>
          Voir la fiche
        </Link>
        {personality.wikipediaUrl ? (
          <a
            className="text-link"
            href={personality.wikipediaUrl}
            target="_blank"
            rel="noreferrer"
          >
            Wikipedia
          </a>
        ) : null}
      </div>
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
    <article className={`content-card fact-card${compact ? " fact-card--compact" : ""}`}>
      <div className="content-card__top">
        <div>
          <p className="eyebrow">
            {fact.personality.name} · {fact.category}
          </p>
          <h3>{fact.title}</h3>
        </div>
        <span className={verdictClass(fact.finalVerdict ?? "unverifiable")}>
          {verdictLabel[fact.finalVerdict ?? "unverifiable"]}
        </span>
      </div>

      <p>{fact.statement}</p>
      <VoteBar fact={fact} />

      <div className="fact-stats-row">
        <span>{fact.totalVotes} votes</span>
        <span>{formatPercent(fact.percentages.true)} vrai</span>
        <span>{formatPercent(fact.percentages.false)} faux</span>
        <span>{formatPercent(fact.percentages.unverifiable)} inv.</span>
      </div>

      <div className="meta-tags">
        <span>{formatDate(fact.happenedAt)}</span>
        <span>{moderationLabel(fact.moderationStatus)}</span>
        {fact.adminOverride ? <span>Veto admin</span> : null}
      </div>

      <div className="card-actions">
        <Link className="button button-secondary" href={`/faits/${fact.slug}`}>
          Ouvrir
        </Link>
        {fact.sourceUrl ? (
          <a className="text-link" href={fact.sourceUrl} target="_blank" rel="noreferrer">
            Source
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function FactsRail({
  facts,
  compact = false,
}: {
  facts: FactView[];
  compact?: boolean;
}) {
  return (
    <div className="portal-grid portal-grid--cards">
      {facts.map((fact) => (
        <FactCard key={fact.id} fact={fact} compact={compact} />
      ))}
    </div>
  );
}

export function PersonalityRail({
  personalities,
  ranked = false,
  compact = false,
}: {
  personalities: PersonalityView[];
  ranked?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`portal-grid ${compact ? "portal-grid--compact" : "portal-grid--cards"}`}>
      {personalities.map((personality, index) => (
        <PersonalityCard
          key={personality.id}
          personality={personality}
          showRank={ranked ? index + 1 : undefined}
        />
      ))}
    </div>
  );
}

export function HomeHero({ data }: { data: HomepageData }) {
  return (
    <section className="showcase-grid">
      <article className="hero-panel hero-panel--main">
        <div className="hero-panel__backdrop" />
        <div className="hero-panel__content">
          <p className="eyebrow">Indice citoyen de fiabilite</p>
          <h1>Un portail public clair, dense et lisible pour suivre qui dit vrai.</h1>
          <p className="hero-copy">
            Pense comme un portail premium: grands focus, rails de contenu, filtres rapides,
            stats visibles et fiches consultables sans friction sur desktop comme sur mobile.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/personnalites">
              Explorer les personnalites
            </Link>
            <Link className="button button-secondary" href="/faits">
              Ouvrir la base de faits
            </Link>
          </div>
          <div className="hero-mini-stats">
            <StatCard
              label="Votes"
              value={formatCompactNumber(data.summary.totalVotes)}
              hint="Jugements publics agreges"
            />
            <StatCard
              label="Faits"
              value={String(data.summary.totalFacts)}
              hint="Declarations suivies"
            />
            <StatCard
              label="Profils"
              value={String(data.summary.totalPersonalities)}
              hint="Personnalites actives"
            />
          </div>
        </div>
      </article>

      <aside className="hero-rail">
        {data.featuredPersonality ? (
          <article className="hero-side-card">
            <p className="eyebrow">Personnalite a la une</p>
            <h3>{data.featuredPersonality.name}</h3>
            <p className="muted">{data.featuredPersonality.role}</p>
            <p>{data.featuredPersonality.summary}</p>
            <div className="meta-tags">
              <span>{data.featuredPersonality.country}</span>
              {data.featuredPersonality.party ? <span>{data.featuredPersonality.party}</span> : null}
            </div>
            <Link className="text-link" href={`/personnalites/${data.featuredPersonality.slug}`}>
              Voir le profil
            </Link>
          </article>
        ) : null}

        {data.featuredFact ? (
          <article className="hero-side-card">
            <p className="eyebrow">Fait epingle</p>
            <h3>{data.featuredFact.title}</h3>
            <p className="muted">{data.featuredFact.personality.name}</p>
            <VoteBar fact={data.featuredFact} />
            <div className="fact-stats-row">
              <span>{data.featuredFact.totalVotes} votes</span>
              <span>{moderationLabel(data.featuredFact.moderationStatus)}</span>
            </div>
            <Link className="text-link" href={`/faits/${data.featuredFact.slug}`}>
              Voir le fait
            </Link>
          </article>
        ) : null}
      </aside>
    </section>
  );
}

export function ListingFilters({
  data,
}: {
  data: FactsListingData;
}) {
  return (
    <form className="filter-panel" method="GET">
      <div className="filter-panel__row">
        <label>
          <span>Recherche</span>
          <input
            name="query"
            defaultValue={data.filters.query}
            placeholder="Nom, phrase, theme, parti..."
          />
        </label>
        <label>
          <span>Theme</span>
          <select name="category" defaultValue={data.filters.category}>
            <option value="">Tous</option>
            {data.availableCategories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Pays</span>
          <select name="country" defaultValue={data.filters.country}>
            <option value="">Tous</option>
            {data.availableCountries.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Parti</span>
          <select name="party" defaultValue={data.filters.party}>
            <option value="">Tous</option>
            {data.availableParties.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Trier</span>
          <select name="sort" defaultValue={data.filters.sort}>
            <option value="hot">Les plus votes</option>
            <option value="newest">Les plus recents</option>
            <option value="reliable">Les plus credibles</option>
            <option value="controversial">Les plus controverses</option>
          </select>
        </label>
      </div>
      <div className="filter-panel__actions">
        <button className="button" type="submit">
          Appliquer
        </button>
        <Link className="button button-secondary" href="/faits">
          Reinitialiser
        </Link>
      </div>
    </form>
  );
}

export function FactsExplorer({
  data,
  queryString,
}: {
  data: FactsListingData;
  queryString: string;
}) {
  return (
    <div className="stack-xl">
      <ListingFilters data={data} />
      <div className="section-title">
        <div>
          <h2>{data.total} faits correspondants</h2>
          <p className="muted">
            Page {data.page} / {data.pageCount} · {data.pageSize} par page
          </p>
        </div>
      </div>
      <div className="portal-grid portal-grid--facts">
        {data.items.map((fact) => (
          <FactCard key={fact.id} fact={fact} />
        ))}
      </div>
      <Pagination
        basePath="/faits"
        page={data.page}
        pageCount={data.pageCount}
        queryString={queryString}
      />
    </div>
  );
}

export function Pagination({
  basePath,
  page,
  pageCount,
  queryString,
}: {
  basePath: string;
  page: number;
  pageCount: number;
  queryString: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  return (
    <nav className="pagination">
      {pages.map((value) => {
        const params = new URLSearchParams(queryString);
        params.set("page", String(value));
        return (
          <Link
            key={value}
            className={`pagination__item${value === page ? " is-active" : ""}`}
            href={`${basePath}?${params.toString()}`}
          >
            {value}
          </Link>
        );
      })}
    </nav>
  );
}

export function PersonalitiesExplorer({
  data,
}: {
  data: PersonalitiesListingData;
}) {
  const [query, setQuery] = useState(data.filters.query);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return data.items;
    return data.items.filter((item) =>
      [item.name, item.role, item.summary, item.country, item.party ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [data.items, query]);

  return (
    <div className="stack-xl">
      <div className="filter-panel">
        <div className="filter-panel__row">
          <label>
            <span>Recherche avancee</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, role, pays, parti..."
            />
          </label>
        </div>
      </div>
      <div className="portal-grid portal-grid--cards">
        {filtered.map((item, index) => (
          <PersonalityCard key={item.id} personality={item} showRank={index + 1} />
        ))}
      </div>
    </div>
  );
}

export const PersonalityDirectory = PersonalitiesExplorer;

export function AdminLoginForm({ error }: { error?: string }) {
  return (
    <form className="admin-login-card" method="POST" action="/api/admin/login">
      <p className="eyebrow">Acces restreint</p>
      <h2>Connexion administrateur</h2>
      <label>
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

function ActionLogItem({ log }: { log: AdminActionLogView }) {
  return (
    <div className="table-row">
      <div>
        <strong>{log.entityLabel}</strong>
        <p className="muted">
          {log.actionType} · {log.actorLabel}
        </p>
      </div>
      <span>{formatDate(log.createdAt)}</span>
    </div>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="admin-shell">
      <section className="stats-grid">
        <StatCard
          label="Stockage"
          value={data.storageMode === "postgresql" ? "PostgreSQL" : "Demo"}
          hint="Persistant si base branchee"
        />
        <StatCard
          label="Votes 7 jours"
          value={formatCompactNumber(data.votesLast7Days)}
          hint="Activite recente"
        />
        <StatCard
          label="Moderation"
          value={String(data.pendingClaims)}
          hint="Faits a arbitrer"
        />
        <StatCard
          label="Visiteurs 7 jours"
          value={formatCompactNumber(data.visitorAnalytics.uniqueVisitorsLast7Days)}
          hint="Trafic estime"
        />
      </section>

      <section className="admin-dashboard-grid">
        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2>Activite visiteurs</h2>
            </div>
          </div>
          <div className="info-grid info-grid--wide">
            <div>
              <strong>{formatCompactNumber(data.visitorAnalytics.pageViewsLast7Days)}</strong>
              <span>Pages vues</span>
            </div>
            <div>
              <strong>{formatCompactNumber(data.summary.uniqueVoters)}</strong>
              <span>Votants uniques</span>
            </div>
            <div>
              <strong>{formatCompactNumber(data.summary.totalVotes)}</strong>
              <span>Votes totaux</span>
            </div>
          </div>
          <div className="table-list">
            {data.visitorAnalytics.topPaths.map((item) => (
              <div className="table-row" key={item.path}>
                <div>
                  <strong>{item.path}</strong>
                </div>
                <span>{item.views} vues</span>
              </div>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Journal admin</p>
              <h2>Dernieres actions</h2>
            </div>
          </div>
          <div className="table-list">
            {data.actionLogs.map((log) => (
              <ActionLogItem key={log.id} log={log} />
            ))}
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid">
        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Moderation fine</p>
              <h2>File de moderation</h2>
            </div>
          </div>
          <div className="stack">
            {data.moderationQueue.map((fact) => (
              <article key={fact.id} className="admin-fact-row">
                <div>
                  <strong>{fact.title}</strong>
                  <p className="muted">
                    {fact.personality.name} · {moderationLabel(fact.moderationStatus)}
                  </p>
                </div>
                <div className="admin-fact-actions">
                  <form method="POST" action="/api/admin/moderation">
                    <input type="hidden" name="factId" value={fact.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="button button-secondary" type="submit">
                      Approuver
                    </button>
                  </form>
                  <form method="POST" action="/api/admin/moderation">
                    <input type="hidden" name="factId" value={fact.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="button button-secondary" type="submit">
                      Rejeter
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Top des faits</p>
              <h2>Les plus consultes / votes</h2>
            </div>
          </div>
          <div className="table-list">
            {data.topFacts.map((fact) => (
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
      </section>

      <section className="admin-forms-grid">
        <article className="content-card form-card">
          <p className="eyebrow">Nouvelle personnalite</p>
          <form method="POST" action="/api/admin/personnalities">
            <label>
              <span>Nom</span>
              <input name="name" required />
            </label>
            <label>
              <span>Role</span>
              <input name="role" required />
            </label>
            <label>
              <span>Resume</span>
              <textarea name="summary" required rows={4} />
            </label>
            <div className="form-grid">
              <label>
                <span>Pays</span>
                <input name="country" defaultValue="France" required />
              </label>
              <label>
                <span>Parti</span>
                <input name="party" />
              </label>
            </div>
            <label>
              <span>Wikipedia</span>
              <input name="wikipediaUrl" type="url" />
            </label>
            <label>
              <span>Accent visuel</span>
              <input name="accent" defaultValue="linear-gradient(135deg, #6d5efc, #231942)" />
            </label>
            <label>
              <span>Note de mise en avant</span>
              <textarea name="highlightNote" rows={3} />
            </label>
            <label className="checkbox-row">
              <input name="isFeatured" type="checkbox" value="true" />
              <span>Mettre en avant</span>
            </label>
            <button className="button" type="submit">
              Ajouter la personnalite
            </button>
          </form>
        </article>

        <article className="content-card form-card">
          <p className="eyebrow">Nouveau fait</p>
          <form method="POST" action="/api/admin/facts">
            <label>
              <span>Personnalite</span>
              <select name="personalitySlug" defaultValue="" required>
                <option value="" disabled>
                  Choisir
                </option>
                {data.personalities.map((personality) => (
                  <option key={personality.id} value={personality.slug}>
                    {personality.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Titre</span>
              <input name="title" required />
            </label>
            <label>
              <span>Affirmation</span>
              <textarea name="statement" required rows={3} />
            </label>
            <label>
              <span>Contexte</span>
              <textarea name="context" required rows={4} />
            </label>
            <div className="form-grid">
              <label>
                <span>Theme</span>
                <input name="category" required />
              </label>
              <label>
                <span>Date du fait</span>
                <input name="happenedAt" type="date" required />
              </label>
            </div>
            <div className="form-grid">
              <label>
                <span>Source</span>
                <input name="sourceLabel" />
              </label>
              <label>
                <span>URL source</span>
                <input name="sourceUrl" type="url" />
              </label>
            </div>
            <label>
              <span>Tags</span>
              <input name="tags" placeholder="economie, emploi, budget" />
            </label>
            <label>
              <span>Moderation initiale</span>
              <select name="moderationStatus" defaultValue="pending">
                <option value="pending">En attente</option>
                <option value="approved">Approuve</option>
                <option value="draft">Brouillon</option>
                <option value="rejected">Rejete</option>
              </select>
            </label>
            <label>
              <span>Note de moderation</span>
              <textarea name="moderationNote" rows={3} />
            </label>
            <label>
              <span>Note de mise en avant</span>
              <textarea name="highlightNote" rows={3} />
            </label>
            <label className="checkbox-row">
              <input name="isFeatured" type="checkbox" value="true" />
              <span>Mettre en avant</span>
            </label>
            <button className="button" type="submit">
              Ajouter le fait
            </button>
          </form>
        </article>
      </section>

      <section className="portal-grid portal-grid--cards">
        {data.facts.map((fact) => (
          <article className="content-card admin-control-card" key={fact.id}>
            <div className="content-card__top">
              <div>
                <p className="eyebrow">{fact.personality.name}</p>
                <h3>{fact.title}</h3>
              </div>
              <span className={verdictClass(fact.finalVerdict ?? "unverifiable")}>
                {verdictLabel[fact.finalVerdict ?? "unverifiable"]}
              </span>
            </div>
            <VoteBar fact={fact} />
            <div className="meta-tags">
              <span>{moderationLabel(fact.moderationStatus)}</span>
              <span>{fact.totalVotes} votes</span>
            </div>
            <form method="POST" action="/api/admin/override">
              <input type="hidden" name="factId" value={fact.id} />
              <label>
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
            <form method="POST" action="/api/admin/feature">
              <input type="hidden" name="entityType" value="fact" />
              <input type="hidden" name="entityId" value={fact.id} />
              <input type="hidden" name="featured" value={fact.isFeatured ? "false" : "true"} />
              <button className="button button-secondary" type="submit">
                {fact.isFeatured ? "Retirer de l'accueil" : "Mettre en avant"}
              </button>
            </form>
            <form method="POST" action="/api/admin/moderation">
              <input type="hidden" name="factId" value={fact.id} />
              <label>
                <span>Moderation</span>
                <select name="status" defaultValue={fact.moderationStatus}>
                  <option value="approved">Approuve</option>
                  <option value="pending">En attente</option>
                  <option value="draft">Brouillon</option>
                  <option value="rejected">Rejete</option>
                </select>
              </label>
              <textarea
                name="note"
                rows={3}
                placeholder="Note de moderation"
                defaultValue={fact.moderationNote ?? ""}
              />
              <button className="button button-secondary" type="submit">
                Mettre a jour
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
