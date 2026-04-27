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
  ImportPreview,
  PersonalityTimelinePoint,
  PersonalityView,
  PersonalitiesListingData,
  PublicContributionPageData,
  Verdict,
  VoteAvailability,
  VoteChallenge,
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
  if (status === "approved") return "Approuvé";
  if (status === "pending") return "En attente";
  if (status === "rejected") return "Rejeté";
  return "Brouillon";
}

function reliabilityTone(score: number) {
  if (score >= 75) return "positive";
  if (score >= 55) return "balanced";
  return "negative";
}

function maxValue(points: Array<{ value: number }>) {
  return points.reduce((max, point) => Math.max(max, point.value), 1);
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
          <Link href="/personnalites">Personnalités</Link>
          <Link href="/faits">Faits</Link>
          <Link href="/contribuer">Contribuer</Link>
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
          <span>Modération admin</span>
          <span>Contributions publiques</span>
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

export function AdSlot({
  label,
  size = "banner",
}: {
  label: string;
  size?: "banner" | "rectangle" | "sidebar";
}) {
  return (
    <aside className={`ad-slot ad-slot--${size}`}>
      <span className="eyebrow">Emplacement pub</span>
      <strong>{label}</strong>
      <p className="muted">Zone prête pour Adsense / régie publicitaire.</p>
    </aside>
  );
}

export function PersonalityCard({
  personality,
  showRank,
}: {
  personality: PersonalityView;
  showRank?: number;
}) {
  const tone = reliabilityTone(personality.score);
  return (
    <article className={`content-card personality-card tone-${tone}`}>
      <div className="content-card__top">
        <div className="identity-strip">
          <span className="identity-strip__avatar" style={{ background: personality.accent }} />
          <div>
            <p className="eyebrow">{showRank ? `Classement #${showRank}` : personality.role}</p>
            <h3>{personality.name}</h3>
          </div>
        </div>
        <span className="score-pill">{formatPercent(personality.score)}</span>
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
  vertical = false,
}: {
  facts: FactView[];
  compact?: boolean;
  vertical?: boolean;
}) {
  return (
    <div className={`portal-grid ${vertical ? "portal-grid--compact" : "portal-grid--cards"}`}>
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
              hint="Personnalités actives"
            />
          </div>
        </div>
      </article>

      <aside className="hero-rail">
        {data.featuredPersonality ? (
          <article className="hero-side-card">
            <p className="eyebrow">Personnalité à la une</p>
            <div className="identity-strip">
              <span
                className="identity-strip__avatar"
                style={{ background: data.featuredPersonality.accent }}
              />
              <div>
                <h3>{data.featuredPersonality.name}</h3>
                <p className="muted">{data.featuredPersonality.role}</p>
              </div>
            </div>
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
            <div className="content-card__top">
              <div>
                <h3>{data.featuredFact.title}</h3>
                <p className="muted">{data.featuredFact.personality.name}</p>
              </div>
              <span className="score-pill">{formatPercent(data.featuredFact.credibilityScore)}</span>
            </div>
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
            <option value="hot">Les plus votés</option>
            <option value="newest">Les plus récents</option>
            <option value="reliable">Les plus crédibles</option>
            <option value="controversial">Les plus controversés</option>
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
      <AdSlot label="Emplacement Adsense horizontal" size="banner" />
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
        <div className="filter-panel__row filter-panel__row--single">
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
      <AdSlot label="Rectangle publicitaire milieu de page" size="rectangle" />
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

export function VotePanel({
  fact,
  availability,
  challenge,
}: {
  fact: FactView;
  availability: VoteAvailability;
  challenge: VoteChallenge;
}) {
  const [answer, setAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function submit(verdict: Verdict) {
    setPending(true);
    setError(false);
    setMessage(null);

    try {
      const response = await fetch(`/api/facts/${fact.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict,
          challengeNonce: challenge.nonce,
          challengeAnswer: answer,
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setError(true);
        setMessage(payload.error ?? "Vote impossible pour le moment.");
        return;
      }

      setMessage(payload.message ?? "Vote enregistre.");
      window.location.reload();
    } catch {
      setError(true);
      setMessage("Erreur reseau, reessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="vote-panel card">
      <div className="vote-panel__header">
        <p className="eyebrow">Vote visiteur</p>
        <h3>Votre lecture de ce fait</h3>
        <p className="muted">
          Vote anonyme limite par appareil et connexion avec un mini challenge anti-abus.
        </p>
      </div>

      <div className="vote-panel__challenge">
        <span className="vote-panel__challenge-label">{challenge.hint}</span>
        <label className="field">
          <span>{challenge.prompt}</span>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Votre reponse"
          />
        </label>
      </div>

      <div className="vote-panel__actions">
        {(["true", "false", "unverifiable"] as Verdict[]).map((verdict) => (
          <button
            key={verdict}
            type="button"
            className={`button ${
              verdict === "true"
                ? "button-true"
                : verdict === "false"
                  ? "button-false"
                  : "button-secondary"
            }`}
            onClick={() => submit(verdict)}
            disabled={pending || !availability.allowed || answer.trim().length === 0}
          >
            {verdictLabel[verdict]}
          </button>
        ))}
      </div>

      {availability.reason ? <p className="error-text">{availability.reason}</p> : null}
      {message ? <p className={error ? "error-text" : "success-text"}>{message}</p> : null}
    </section>
  );
}

function MiniBarChart({
  title,
  points,
}: {
  title: string;
  points: Array<{ label: string; value: number }>;
}) {
  const max = maxValue(points);
  return (
    <article className="content-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Graphique</p>
          <h3>{title}</h3>
        </div>
      </div>
      <div className="chart-surface">
        <svg className="chart-svg chart-svg--bars" viewBox="0 0 100 40" preserveAspectRatio="none">
          {points.map((point, index) => {
            const width = 100 / Math.max(points.length, 1);
            const gap = width * 0.18;
            const barWidth = width - gap;
            const height = Math.max(4, (point.value / max) * 34);
            const x = index * width + gap / 2;
            const y = 38 - height;
            return (
              <rect
                key={`${title}-bar-${point.label}`}
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx="1.5"
                className="chart-bar"
              />
            );
          })}
        </svg>
      </div>
      <div className="analytics-bars">
        {points.map((point) => (
          <div className="analytics-bar" key={`${title}-${point.label}`}>
            <span>{point.label}</span>
            <div className="analytics-bar-track">
              <div
                className="analytics-bar-fill"
                style={{ width: `${Math.max(6, (point.value / max) * 100)}%` }}
              />
            </div>
            <strong>{point.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function TimelineChart({
  title,
  subtitle,
  suffix = "",
  points,
}: {
  title: string;
  subtitle?: string;
  suffix?: string;
  points: PersonalityTimelinePoint[];
}) {
  const max = maxValue(points.map((point) => ({ value: point.value })));
  const path = points
    .map((point, index) => {
      const x = points.length <= 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 38 - (point.value / max) * 32;
      return `${index === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
  return (
    <article className="content-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Évolution</p>
          <h3>{title}</h3>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-surface">
        <svg className="chart-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path d={path} className="chart-line" />
          {points.map((point, index) => {
            const x = points.length <= 1 ? 50 : (index / (points.length - 1)) * 100;
            const y = 38 - (point.value / max) * 32;
            return <circle key={`${title}-dot-${point.label}`} cx={x} cy={y} r="1.8" className="chart-dot" />;
          })}
        </svg>
      </div>
      <div className="analytics-bars">
        {points.map((point) => (
          <div className="analytics-bar" key={`${title}-${point.label}`}>
            <span>{point.label}</span>
            <div className="analytics-bar-track">
              <div
                className="analytics-bar-fill"
                style={{ width: `${Math.max(4, (point.value / max) * 100)}%` }}
              />
            </div>
            <strong>
              {point.value}
              {suffix}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}

export const ReliabilityTimelineChart = TimelineChart;

export function AdminSubnav() {
  return (
    <nav className="admin-subnav">
      <Link href="/admin">Vue d’ensemble</Link>
      <Link href="/admin/stats">Statistiques</Link>
      <Link href="/admin/contributions">Contributions</Link>
      <Link href="/admin/data">Données</Link>
    </nav>
  );
}

export function AdminStatsPanel({ data }: { data: AdminDashboardData }) {
  const voteTrend = data.voteTimeline.map((point) => ({
    label: point.label,
    value: point.totalVotes,
  }));

  return (
    <div className="admin-shell">
      <section className="stats-grid">
        <StatCard
          label="Votes 7 jours"
          value={formatCompactNumber(data.votesLast7Days)}
          hint="Activité récente"
        />
        <StatCard
          label="Contributions"
          value={String(data.pendingClaims)}
          hint="Éléments à valider"
        />
        <StatCard
          label="Visiteurs 7 jours"
          value={formatCompactNumber(data.visitorAnalytics.uniqueVisitorsLast7Days)}
          hint="Trafic estimé"
        />
        <StatCard
          label="Pages vues"
          value={formatCompactNumber(data.visitorAnalytics.pageViewsLast7Days)}
          hint="Audience récente"
        />
      </section>

      <section className="admin-dashboard-grid">
        <MiniBarChart title="Votes dans le temps" points={voteTrend} />
        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Audience</p>
              <h2>Chemins les plus consultés</h2>
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
      </section>

      <section className="admin-dashboard-grid">
        {data.reliabilityByPersonality.slice(0, 6).map((entry) => (
          <TimelineChart
            key={entry.personality.id}
            title={`Fiabilité de ${entry.personality.name}`}
            suffix="%"
            points={entry.history}
          />
        ))}
      </section>
    </div>
  );
}

export function AdminContributionsPanel({ data }: { data: AdminDashboardData }) {
  return (
    <div className="admin-shell">
      <section className="admin-dashboard-grid">
        <article className="content-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Modération fine</p>
              <h2>File de validation</h2>
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
                    <input type="hidden" name="moderationStatus" value="approved" />
                    <button className="button button-secondary" type="submit">
                      Approuver
                    </button>
                  </form>
                  <form method="POST" action="/api/admin/moderation">
                    <input type="hidden" name="factId" value={fact.id} />
                    <input type="hidden" name="moderationStatus" value="rejected" />
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
              <p className="eyebrow">Personnalités proposées</p>
              <h2>Soumissions publiques</h2>
            </div>
          </div>
          <div className="table-list">
            {data.submissionQueue.personalities.map((submission) => (
              <div className="table-row" key={`person-${submission.id}`}>
                <div>
                  <strong>{submission.name}</strong>
                  <p className="muted">
                    {submission.role} · {submission.country}
                  </p>
                </div>
                <span>{submission.status}</span>
              </div>
            ))}
          </div>
          <div className="section-heading section-heading--sub">
            <div>
              <p className="eyebrow">Faits proposés</p>
              <h2>Soumissions récentes</h2>
            </div>
          </div>
          <div className="table-list">
            {data.submissionQueue.facts.map((submission) => (
              <div className="table-row" key={`fact-${submission.id}`}>
                <div>
                  <strong>{submission.title}</strong>
                  <p className="muted">
                    {submission.personalityName} · {submission.category}
                  </p>
                </div>
                <span>{submission.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export function AdminDataPanel({ data }: { data: AdminDashboardData }) {
  return (
    <div className="admin-shell">
      <section className="admin-dashboard-grid">
        <ImportPreviewPanel
          title="Import CSV personnalités"
          action="/api/admin/import/personnalities"
          preview={data.personalityImportPreview}
        />
        <ImportPreviewPanel
          title="Import CSV faits"
          action="/api/admin/import/facts"
          preview={data.factImportPreview}
        />
      </section>

      <PersonalityTableEditor personalities={data.personalities} />

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
                <span>Véto admin</span>
                <select name="outcome" defaultValue={fact.adminOverride ?? ""}>
                  <option value="">Pas de véto</option>
                  <option value="true">Vrai à 100%</option>
                  <option value="false">Faux à 100%</option>
                  <option value="unverifiable">Invérifiable à 100%</option>
                </select>
              </label>
              <button className="button button-secondary" type="submit">
                Sauvegarder le véto
              </button>
            </form>
            <form method="POST" action="/api/admin/feature">
              <input type="hidden" name="entityType" value="fact" />
              <input type="hidden" name="entityId" value={fact.id} />
              <input type="hidden" name="featured" value={fact.isFeatured ? "false" : "true"} />
              <button className="button button-secondary" type="submit">
                {fact.isFeatured ? "Retirer de l’accueil" : "Mettre en avant"}
              </button>
            </form>
            <form method="POST" action="/api/admin/moderation">
              <input type="hidden" name="factId" value={fact.id} />
              <label>
                <span>Modération</span>
                <select name="moderationStatus" defaultValue={fact.moderationStatus}>
                  <option value="approved">Approuvé</option>
                  <option value="pending">En attente</option>
                  <option value="draft">Brouillon</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </label>
              <textarea
                name="moderationNote"
                rows={3}
                placeholder="Note de modération"
                defaultValue={fact.moderationNote ?? ""}
              />
              <button className="button button-secondary" type="submit">
                Mettre à jour
              </button>
            </form>
          </article>
        ))}
      </section>
    </div>
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

function ImportPreviewPanel({
  title,
  action,
  preview,
}: {
  title: string;
  action: string;
  preview: ImportPreview;
}) {
  return (
    <article className="content-card form-card">
      <p className="eyebrow">{title}</p>
      <p className="muted">
        CSV attendu avec en-tetes. Aperçu: {preview.rows.length} ligne(s) prêtes.
      </p>
      <form method="POST" action={action}>
        <label>
          <span>Coller le CSV</span>
          <textarea name="csv" rows={8} placeholder="name,role,country,party,wikipediaUrl,summary,accent" />
        </label>
        <div className="checkbox-row">
          <input id={`${title}-preview`} type="checkbox" name="previewOnly" value="true" />
          <label htmlFor={`${title}-preview`}>Tester l&apos;import sans écrire en base</label>
        </div>
        <div className="checkbox-row">
          <input id={`${title}-reset`} type="checkbox" name="resetExisting" value="true" />
          <label htmlFor={`${title}-reset`}>Supprimer les données existantes avant import</label>
        </div>
        <button className="button" type="submit">
          Importer
        </button>
      </form>
      {preview.rows.length > 0 ? (
        <div className="table-list">
          {preview.rows.map((row, index) => (
            <div key={`${title}-${index}`} className="table-row">
              <div>
                <strong>{row[0] ?? "Ligne"}</strong>
                <p className="muted">{row.slice(1).join(" · ")}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function PersonalityTableEditor({ personalities }: { personalities: PersonalityView[] }) {
  return (
    <article className="content-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Edition rapide</p>
          <h2>Tableau des personnalites</h2>
        </div>
      </div>
      <div className="table-list">
        {personalities.map((personality) => (
          <form
            key={personality.id}
            className="table-edit-form"
            method="POST"
            action="/api/admin/personnalities/update"
          >
            <input type="hidden" name="personalityId" value={personality.id} />
            <div className="form-grid form-grid--wide">
              <label>
                <span>Nom</span>
                <input name="name" defaultValue={personality.name} />
              </label>
              <label>
                <span>Role</span>
                <input name="role" defaultValue={personality.role} />
              </label>
              <label>
                <span>Pays</span>
                <input name="country" defaultValue={personality.country} />
              </label>
              <label>
                <span>Parti</span>
                <input name="party" defaultValue={personality.party ?? ""} />
              </label>
              <label>
                <span>Wikipedia</span>
                <input name="wikipediaUrl" defaultValue={personality.wikipediaUrl ?? ""} />
              </label>
              <label>
                <span>Accent</span>
                <input name="accent" defaultValue={personality.accent} />
              </label>
            </div>
            <label>
              <span>Resume</span>
              <textarea name="summary" rows={3} defaultValue={personality.summary} />
            </label>
            <button className="button button-secondary" type="submit">
              Sauvegarder cette ligne
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}

export function AdminDashboard({
  data,
  section = "overview",
}: {
  data: AdminDashboardData;
  section?: "overview" | "stats" | "contributions" | "data";
}) {
  const voteTrend = data.voteTimeline.map((point) => ({
    label: point.label,
    value: point.totalVotes,
  }));

  return (
    <div className="admin-shell">
      <nav className="admin-subnav">
        <Link href="/admin">Vue d’ensemble</Link>
        <Link href="/admin/stats">Statistiques</Link>
        <Link href="/admin/contributions">Contributions</Link>
        <Link href="/admin/data">Données</Link>
      </nav>

      {(section === "overview" || section === "stats") ? (
        <>
          <section className="stats-grid">
            <StatCard
              label="Stockage"
              value={data.storageMode === "postgresql" ? "PostgreSQL" : "Demo"}
              hint="Persistant si base branchée"
            />
            <StatCard
              label="Votes 7 jours"
              value={formatCompactNumber(data.votesLast7Days)}
              hint="Activité récente"
            />
            <StatCard
              label="Modération"
              value={String(data.pendingClaims)}
              hint="Faits à arbitrer"
            />
            <StatCard
              label="Visiteurs 7 jours"
              value={formatCompactNumber(data.visitorAnalytics.uniqueVisitorsLast7Days)}
              hint="Trafic estimé"
            />
          </section>

          <section className="admin-dashboard-grid">
            <MiniBarChart title="Votes dans le temps" points={voteTrend} />
            <article className="content-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Analytics</p>
                  <h2>Activité visiteurs</h2>
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
                <div>
                  <strong>{data.visitorAnalytics.bounceRateEstimate}%</strong>
                  <span>Taux de rebond estimé</span>
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
          </section>

          <section className="admin-dashboard-grid">
            {data.reliabilityByPersonality.slice(0, 4).map((entry) => (
              <TimelineChart
                key={entry.personality.id}
                title={`Fiabilité de ${entry.personality.name}`}
                suffix="%"
                points={entry.history}
              />
            ))}
          </section>
        </>
      ) : null}

      {(section === "overview" || section === "contributions") ? (
        <section className="admin-dashboard-grid">
          <article className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Journal admin</p>
                <h2>Dernières actions</h2>
              </div>
            </div>
            <div className="table-list">
              {data.actionLogs.map((log) => (
                <ActionLogItem key={log.id} log={log} />
              ))}
            </div>
          </article>

          <article className="content-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Modération fine</p>
                <h2>File de modération</h2>
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
                      <input type="hidden" name="moderationStatus" value="approved" />
                      <button className="button button-secondary" type="submit">
                        Approuver
                      </button>
                    </form>
                    <form method="POST" action="/api/admin/moderation">
                      <input type="hidden" name="factId" value={fact.id} />
                      <input type="hidden" name="moderationStatus" value="rejected" />
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
                <p className="eyebrow">Contributions publiques</p>
                <h2>Personnalités proposées</h2>
              </div>
            </div>
            <div className="table-list">
              {data.submissionQueue.personalities.map((submission) => (
                <div className="table-row" key={`person-${submission.id}`}>
                  <div>
                    <strong>{submission.name}</strong>
                    <p className="muted">
                      {submission.role} · {submission.country}
                    </p>
                  </div>
                  <span>{submission.status}</span>
                </div>
              ))}
            </div>
            <div className="section-heading section-heading--sub">
              <div>
                <p className="eyebrow">Contributions publiques</p>
                <h2>Faits proposés</h2>
              </div>
            </div>
            <div className="table-list">
              {data.submissionQueue.facts.map((submission) => (
                <div className="table-row" key={`fact-${submission.id}`}>
                  <div>
                    <strong>{submission.title}</strong>
                    <p className="muted">
                      {submission.personalitySlug} · {submission.category}
                    </p>
                  </div>
                  <span>{submission.status}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {(section === "overview" || section === "data") ? (
        <>
          <section className="admin-dashboard-grid">
            <article className="content-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Top des faits</p>
                  <h2>Les plus consultés / votés</h2>
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
          <p className="eyebrow">Nouvelle personnalité</p>
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
                  <option key={personality.slug} value={personality.slug}>
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
                <span>Thème</span>
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
              <input name="tags" placeholder="économie, emploi, budget" />
            </label>
            <label>
              <span>Modération initiale</span>
              <select name="moderationStatus" defaultValue="pending">
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="draft">Brouillon</option>
                <option value="rejected">Rejeté</option>
              </select>
            </label>
            <label>
              <span>Note de modération</span>
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

          <section className="admin-dashboard-grid">
            <ImportPreviewPanel
              title="Import CSV personnalités"
              action="/api/admin/import/personnalities"
              preview={data.personalityImportPreview}
            />
            <ImportPreviewPanel
              title="Import CSV faits"
              action="/api/admin/import/facts"
              preview={data.factImportPreview}
            />
          </section>

          <PersonalityTableEditor personalities={data.personalities} />

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
                      <option value="true">Vrai à 100%</option>
                      <option value="false">Faux à 100%</option>
                      <option value="unverifiable">Invérifiable à 100%</option>
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
                    <span>Modération</span>
                    <select name="moderationStatus" defaultValue={fact.moderationStatus}>
                      <option value="approved">Approuvé</option>
                      <option value="pending">En attente</option>
                      <option value="draft">Brouillon</option>
                      <option value="rejected">Rejeté</option>
                    </select>
                  </label>
                  <textarea
                    name="moderationNote"
                    rows={3}
                    placeholder="Note de modération"
                    defaultValue={fact.moderationNote ?? ""}
                  />
                  <button className="button button-secondary" type="submit">
                    Mettre à jour
                  </button>
                </form>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}

export function AdminStatsView({ data }: { data: AdminDashboardData }) {
  return <AdminDashboard data={data} section="stats" />;
}

export function AdminContributionsView({ data }: { data: AdminDashboardData }) {
  return <AdminDashboard data={data} section="contributions" />;
}

export function AdminDataManagement({ data }: { data: AdminDashboardData }) {
  return <AdminDashboard data={data} section="data" />;
}

export function ContributionHub({ data }: { data: PublicContributionPageData }) {
  return (
    <div className="stack-2xl">
      <section className="page-hero compact-hero">
        <div className="page-hero__copy">
          <p className="eyebrow">Participation publique</p>
          <h1>Proposez un nouveau profil ou un nouveau fait.</h1>
          <p className="muted">
            Cette section permet aux visiteurs d&apos;enrichir la base. Chaque soumission
            entre dans une file de validation simple côté admin.
          </p>
        </div>
      </section>

      <section className="admin-forms-grid">
        <article className="content-card form-card">
          <p className="eyebrow">Soumettre une personnalite</p>
          <form method="POST" action="/api/public/personnalities">
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
              <textarea name="summary" rows={4} required />
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
              <span>Email ou pseudo (optionnel)</span>
              <input name="submitterLabel" />
            </label>
            <button className="button" type="submit">
              Envoyer pour validation
            </button>
          </form>
        </article>

        <article className="content-card form-card">
          <p className="eyebrow">Soumettre un fait</p>
          <form method="POST" action="/api/public/facts">
            <label>
              <span>Personnalite concernee</span>
              <select name="personalitySlug" defaultValue="" required>
                <option value="" disabled>
                  Choisir
                </option>
                {data.availablePersonalities.map((personality) => (
                  <option key={personality.slug} value={personality.slug}>
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
              <textarea name="statement" rows={3} required />
            </label>
            <label>
              <span>Contexte</span>
              <textarea name="context" rows={4} required />
            </label>
            <div className="form-grid">
              <label>
                <span>Theme</span>
                <input name="category" required />
              </label>
              <label>
                <span>Date</span>
                <input name="happenedAt" type="date" required />
              </label>
            </div>
            <label>
              <span>Source</span>
              <input name="sourceLabel" />
            </label>
            <label>
              <span>URL source</span>
              <input name="sourceUrl" type="url" />
            </label>
            <label>
              <span>Tags</span>
              <input name="tags" placeholder="sante, economie, budget" />
            </label>
            <label>
              <span>Email ou pseudo (optionnel)</span>
              <input name="submitterLabel" />
            </label>
            <button className="button" type="submit">
              Envoyer pour validation
            </button>
          </form>
        </article>
      </section>

      <section className="content-card">
        <SectionTitle
          kicker="Moderation ouverte"
          title="Soumissions recentes"
          description="Les visiteurs peuvent proposer de nouveaux contenus ; l&apos;admin les approuve en un clic."
        />
        <div className="table-list">
          {data.recentSubmissions.map((submission) => (
            <div className="table-row" key={submission.id}>
              <div>
                <strong>{submission.title}</strong>
                <p className="muted">
                  {submission.kind === "personality" ? "Personnalite" : "Fait"} ·{" "}
                  {submission.status}
                </p>
              </div>
              <span>{formatDate(submission.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>

      <AdSlot label="Sidebar / in-content publicitaire" size="sidebar" />
    </div>
  );
}
