import "server-only";

import crypto from "node:crypto";

import { cookies, headers } from "next/headers";

import { hasDatabase, sql } from "@/lib/db";
import { factSeeds, personalitySeeds } from "@/lib/sample-data";
import type {
  AdminActionLogView,
  AdminDashboardData,
  CreateFactInput,
  CreatePersonalityInput,
  FactFilterParams,
  FactPageData,
  FactRow,
  FactsListingData,
  FactView,
  ModerationStatus,
  PersonalityPageData,
  PersonalitiesListingData,
  PersonalityRow,
  PersonalitySnippet,
  PersonalityView,
  RecentVoteView,
  SiteSummary,
  Verdict,
  VerdictPercentages,
  VisitorAnalytics,
  VoteChallenge,
  VoteCounts,
  VoteRow,
  VoteSubmissionInput,
  VoteSubmissionResult,
  HomepageData,
} from "@/lib/types";

const VOTE_WINDOW_HOURS = Number(process.env.VOTE_COOLDOWN_HOURS ?? "24");
const MAX_VOTES_PER_IP_PER_HOUR = Number(process.env.MAX_VOTES_PER_IP_PER_HOUR ?? "12");
const FACTS_PAGE_SIZE = Number(process.env.FACTS_PAGE_SIZE ?? "8");

type AuditLogRow = {
  id: number;
  action_type: string;
  entity_type: "personality" | "fact" | "vote" | "auth";
  entity_id: number | null;
  entity_label: string;
  actor_label: string;
  metadata: string | null;
  created_at: string;
};

type VisitorEventRow = {
  id: number;
  path: string;
  visitor_hash: string;
  user_agent_hash: string;
  ip_hash: string;
  created_at: string;
};

type MemoryState = {
  initialized: boolean;
  personalities: PersonalityRow[];
  facts: FactRow[];
  votes: VoteRow[];
  auditLogs: AuditLogRow[];
  visitors: VisitorEventRow[];
};

const memoryState: MemoryState = {
  initialized: false,
  personalities: [],
  facts: [],
  votes: [],
  auditLogs: [],
  visitors: [],
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function emptyCounts(): VoteCounts {
  return { true: 0, false: 0, unverifiable: 0 };
}

function toPercentages(counts: VoteCounts): VerdictPercentages {
  const total = counts.true + counts.false + counts.unverifiable;
  if (!total) {
    return { true: 0, false: 0, unverifiable: 0 };
  }

  const truePct = Math.round((counts.true / total) * 100);
  const falsePct = Math.round((counts.false / total) * 100);

  return {
    true: truePct,
    false: falsePct,
    unverifiable: Math.max(0, 100 - truePct - falsePct),
  };
}

function scoreFromPercentages(percentages: VerdictPercentages) {
  return Math.max(0, Math.min(100, percentages.true + percentages.unverifiable * 0.5));
}

function winningVerdict(counts: VoteCounts): Verdict | null {
  const ordered = (["true", "false", "unverifiable"] as const)
    .map((verdict) => ({ verdict, value: counts[verdict] }))
    .sort((a, b) => b.value - a.value);

  return ordered[0].value === 0 ? null : ordered[0].verdict;
}

function reliabilityLabel(score: number) {
  if (score >= 75) return "Tres fiable";
  if (score >= 55) return "Plutot fiable";
  if (score >= 40) return "Disputee";
  return "Fragile";
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safePage(page?: number) {
  if (!page || !Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function paginate<T>(items: T[], page?: number, pageSize = FACTS_PAGE_SIZE) {
  const current = safePage(page);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const bounded = Math.min(current, pageCount);
  const start = (bounded - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: bounded,
    pageCount,
    total,
    pageSize,
  };
}

function buildPersonalityRow(seed: (typeof personalitySeeds)[number], id: number): PersonalityRow {
  return {
    id,
    slug: seed.slug,
    name: seed.name,
    role: seed.role,
    summary: seed.summary,
    accent: seed.accent,
    country: seed.country ?? "France",
    party: seed.party ?? null,
    wikipedia_url: seed.wikipediaUrl ?? null,
    is_featured: Boolean(seed.isFeatured),
    highlight_note: seed.highlightNote ?? null,
    created_at: new Date("2026-01-05").toISOString(),
  };
}

function buildFactRow(seed: (typeof factSeeds)[number], personalityId: number, id: number): FactRow {
  return {
    id,
    personality_id: personalityId,
    slug: seed.slug,
    title: seed.title,
    statement: seed.statement,
    context: seed.context,
    category: seed.category,
    source_label: seed.sourceLabel ?? null,
    source_url: seed.sourceUrl ?? null,
    admin_override: seed.adminOverride ?? null,
    moderation_status: seed.moderationStatus ?? "approved",
    moderation_note: seed.moderationNote ?? null,
    is_featured: Boolean(seed.isFeatured),
    highlight_note: seed.highlightNote ?? null,
    tags: seed.tags,
    happened_at: seed.happenedAt,
    created_at: new Date("2026-01-15").toISOString(),
    updated_at: new Date("2026-04-15").toISOString(),
  };
}

function seededVotes(factId: number, counts: VoteCounts, offset: number): VoteRow[] {
  const verdicts: Verdict[] = [
    ...Array.from({ length: counts.true }, () => "true" as const),
    ...Array.from({ length: counts.false }, () => "false" as const),
    ...Array.from({ length: counts.unverifiable }, () => "unverifiable" as const),
  ];

  return verdicts.map((verdict, index) => ({
    id: offset + index + 1,
    fact_id: factId,
    verdict,
    fingerprint_hash: `seed-fingerprint-${factId}-${index}`,
    visitor_token: `seed-visitor-${factId}-${index}`,
    ip_hash: `seed-ip-${factId}-${index}`,
    user_agent_hash: `seed-ua-${factId}-${index}`,
    challenge_answer_hash: `seed-answer-${factId}-${index}`,
    challenge_nonce: `seed-nonce-${factId}-${index}`,
    created_at: new Date(Date.now() - index * 1000 * 60 * 31).toISOString(),
    updated_at: new Date(Date.now() - index * 1000 * 60 * 31).toISOString(),
  }));
}

function ensureMemoryBootstrapped() {
  if (memoryState.initialized) {
    return;
  }

  memoryState.personalities = personalitySeeds.map((seed, index) =>
    buildPersonalityRow(seed, index + 1),
  );

  const personalityBySlug = new Map(
    memoryState.personalities.map((personality) => [personality.slug, personality.id]),
  );

  let voteOffset = 0;
  memoryState.facts = factSeeds.map((seed, index) => {
    const personalityId = personalityBySlug.get(seed.personalitySlug) ?? 1;
    const fact = buildFactRow(seed, personalityId, index + 1);
    const votes = seededVotes(fact.id, seed.seedVotes ?? { true: 20, false: 20, unverifiable: 20 }, voteOffset);
    voteOffset += votes.length;
    memoryState.votes.push(...votes);
    return fact;
  });

  memoryState.auditLogs.push({
    id: 1,
    action_type: "bootstrap",
    entity_type: "auth",
    entity_id: null,
    entity_label: "Initialisation",
    actor_label: "system",
    metadata: "Donnees de demonstration chargees",
    created_at: new Date().toISOString(),
  });

  memoryState.initialized = true;
}

async function initDatabase() {
  if (!hasDatabase || !sql) {
    ensureMemoryBootstrapped();
    return;
  }

  await sql.begin(async (tx) => {
    await tx`
      create table if not exists personalities (
        id serial primary key,
        slug text unique not null,
        name text not null,
        role text not null,
        summary text not null,
        accent text not null,
        country text not null default 'France',
        party text,
        wikipedia_url text,
        is_featured boolean not null default false,
        highlight_note text,
        created_at timestamptz not null default now()
      )
    `;

    await tx`
      create table if not exists facts (
        id serial primary key,
        personality_id integer not null references personalities(id) on delete cascade,
        slug text unique not null,
        title text not null,
        statement text not null,
        context text not null,
        category text not null,
        source_label text,
        source_url text,
        admin_override text check (admin_override in ('true', 'false', 'unverifiable')),
        moderation_status text not null default 'approved' check (moderation_status in ('pending', 'approved', 'under_review', 'rejected')),
        moderation_note text,
        is_featured boolean not null default false,
        highlight_note text,
        tags text[] not null default '{}',
        happened_at timestamptz not null default now(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `;

    await tx`
      create table if not exists votes (
        id serial primary key,
        fact_id integer not null references facts(id) on delete cascade,
        verdict text not null check (verdict in ('true', 'false', 'unverifiable')),
        fingerprint_hash text not null,
        visitor_token text not null,
        ip_hash text not null,
        user_agent_hash text not null,
        challenge_answer_hash text not null,
        challenge_nonce text not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (fact_id, fingerprint_hash)
      )
    `;

    await tx`
      create table if not exists admin_audit_logs (
        id serial primary key,
        action_type text not null,
        entity_type text not null,
        entity_id integer,
        entity_label text not null,
        actor_label text not null,
        metadata text,
        created_at timestamptz not null default now()
      )
    `;

    await tx`
      create table if not exists visitor_events (
        id serial primary key,
        path text not null,
        visitor_hash text not null,
        user_agent_hash text not null,
        ip_hash text not null,
        created_at timestamptz not null default now()
      )
    `;

    for (const [index, seed] of personalitySeeds.entries()) {
      await tx`
        insert into personalities (
          slug, name, role, summary, accent, country, party, wikipedia_url, is_featured, highlight_note
        ) values (
          ${seed.slug},
          ${seed.name},
          ${seed.role},
          ${seed.summary},
          ${seed.accent},
          ${seed.country ?? "France"},
          ${seed.party ?? null},
          ${seed.wikipediaUrl ?? null},
          ${Boolean(seed.isFeatured)},
          ${seed.highlightNote ?? null}
        )
        on conflict (slug) do nothing
      `;

      if (index === 0) {
        await tx`
          insert into admin_audit_logs (action_type, entity_type, entity_label, actor_label, metadata)
          values ('bootstrap', 'auth', 'Initialisation', 'system', 'Base Veridicte initialisee')
          on conflict do nothing
        `;
      }
    }

    const dbPersonalities = await tx<PersonalityRow[]>`
      select * from personalities order by id asc
    `;
    const bySlug = new Map(dbPersonalities.map((row) => [row.slug, row.id]));

    for (const seed of factSeeds) {
      const personalityId = bySlug.get(seed.personalitySlug);
      if (!personalityId) continue;

      await tx`
        insert into facts (
          personality_id, slug, title, statement, context, category, source_label, source_url,
          admin_override, moderation_status, moderation_note, is_featured, highlight_note, tags, happened_at
        ) values (
          ${personalityId},
          ${seed.slug},
          ${seed.title},
          ${seed.statement},
          ${seed.context},
          ${seed.category},
          ${seed.sourceLabel ?? null},
          ${seed.sourceUrl ?? null},
          ${seed.adminOverride ?? null},
          ${seed.moderationStatus ?? "approved"},
          ${seed.moderationNote ?? null},
          ${Boolean(seed.isFeatured)},
          ${seed.highlightNote ?? null},
          ${seed.tags},
          ${seed.happenedAt}
        )
        on conflict (slug) do nothing
      `;
    }
  });
}

async function getRows() {
  await initDatabase();

  if (!hasDatabase || !sql) {
    return {
      personalities: clone(memoryState.personalities),
      facts: clone(memoryState.facts),
      votes: clone(memoryState.votes),
      auditLogs: clone(memoryState.auditLogs),
      visitors: clone(memoryState.visitors),
    };
  }

  const [personalities, facts, votes, auditLogs, visitors] = await Promise.all([
    sql<PersonalityRow[]>`select * from personalities order by name asc`,
    sql<FactRow[]>`select * from facts order by updated_at desc, id desc`,
    sql<VoteRow[]>`select * from votes order by updated_at desc, id desc`,
    sql<AuditLogRow[]>`select * from admin_audit_logs order by created_at desc, id desc`,
    sql<VisitorEventRow[]>`select * from visitor_events order by created_at desc, id desc`,
  ]);

  return { personalities, facts, votes, auditLogs, visitors };
}

function buildPersonalitySnippet(row: PersonalityRow): PersonalitySnippet {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    country: row.country,
    party: row.party,
    wikipediaUrl: row.wikipedia_url,
    accent: row.accent,
  };
}

function buildFactView(
  fact: FactRow,
  personality: PersonalityRow,
  votes: VoteRow[],
): FactView {
  const counts = votes.reduce<VoteCounts>((acc, vote) => {
    acc[vote.verdict] += 1;
    return acc;
  }, emptyCounts());

  const crowdPercentages = toPercentages(counts);
  const percentages =
    fact.admin_override === null
      ? crowdPercentages
      : {
          true: fact.admin_override === "true" ? 100 : 0,
          false: fact.admin_override === "false" ? 100 : 0,
          unverifiable: fact.admin_override === "unverifiable" ? 100 : 0,
        };
  const controversyScore = Math.max(
    0,
    100 -
      Math.abs(crowdPercentages.true - crowdPercentages.false) -
      Math.abs(crowdPercentages.unverifiable - 34),
  );

  return {
    id: fact.id,
    slug: fact.slug,
    title: fact.title,
    statement: fact.statement,
    context: fact.context,
    category: fact.category,
    sourceLabel: fact.source_label,
    sourceUrl: fact.source_url,
    adminOverride: fact.admin_override,
    moderationStatus: fact.moderation_status,
    moderationNote: fact.moderation_note,
    isFeatured: fact.is_featured,
    highlightNote: fact.highlight_note,
    tags: fact.tags,
    happenedAt: fact.happened_at,
    createdAt: fact.created_at,
    updatedAt: fact.updated_at,
    totalVotes: votes.length,
    counts,
    percentages,
    crowdPercentages,
    crowdWinner: winningVerdict(counts),
    finalVerdict: fact.admin_override ?? winningVerdict(counts),
    credibilityScore: scoreFromPercentages(percentages),
    controversyScore,
    personality: buildPersonalitySnippet(personality),
  };
}

function buildPersonalityView(
  personality: PersonalityRow,
  facts: FactView[],
): PersonalityView {
  const totalVotes = facts.reduce((acc, fact) => acc + fact.totalVotes, 0);
  const score =
    facts.length > 0
      ? Math.round(facts.reduce((acc, fact) => acc + fact.credibilityScore, 0) / facts.length)
      : 50;

  const finalVerdicts = facts.reduce<VoteCounts>((acc, fact) => {
    if (fact.finalVerdict) {
      acc[fact.finalVerdict] += 1;
    }
    return acc;
  }, emptyCounts());

  return {
    id: personality.id,
    slug: personality.slug,
    name: personality.name,
    role: personality.role,
    summary: personality.summary,
    accent: personality.accent,
    country: personality.country,
    party: personality.party,
    wikipediaUrl: personality.wikipedia_url,
    isFeatured: personality.is_featured,
    highlightNote: personality.highlight_note,
    createdAt: personality.created_at,
    totalVotes,
    score,
    reliabilityLabel: reliabilityLabel(score),
    factCount: facts.length,
    factVerdicts: finalVerdicts,
    facts: facts
      .slice()
      .sort((a, b) => b.totalVotes - a.totalVotes || a.title.localeCompare(b.title, "fr")),
  };
}

function buildAuditLogViews(rows: AuditLogRow[]): AdminActionLogView[] {
  return rows.slice(0, 25).map((row) => ({
    id: row.id,
    actionType: row.action_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    actorLabel: row.actor_label,
    metadata: row.metadata,
    createdAt: row.created_at,
  }));
}

function buildRecentVotes(rows: VoteRow[], factById: Map<number, FactView>): RecentVoteView[] {
  return rows.slice(0, 14).map((vote) => {
    const fact = factById.get(vote.fact_id);
    return {
      id: vote.id,
      verdict: vote.verdict,
      updatedAt: vote.updated_at,
      factSlug: fact?.slug ?? "inconnu",
      factTitle: fact?.title ?? "Fait inconnu",
      personalityName: fact?.personality.name ?? "Personnalite inconnue",
    };
  });
}

function buildVisitorAnalytics(visitors: VisitorEventRow[]): VisitorAnalytics {
  const last7Days = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const recent = visitors.filter((row) => +new Date(row.created_at) >= last7Days);
  const uniqueVisitors = new Set(recent.map((row) => row.visitor_hash)).size;
  const byPath = new Map<string, number>();

  for (const row of recent) {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  }

  const topPaths = [...byPath.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, views]) => ({ path, views }));

  return {
    pageViewsLast7Days: recent.length,
    uniqueVisitorsLast7Days: uniqueVisitors,
    topPaths,
    bounceRateEstimate:
      uniqueVisitors === 0
        ? 0
        : Math.max(0, Math.min(100, Math.round((uniqueVisitors / Math.max(recent.length, 1)) * 100))),
  };
}

async function buildData() {
  const rows = await getRows();

  const votesByFactId = new Map<number, VoteRow[]>();
  for (const vote of rows.votes) {
    const current = votesByFactId.get(vote.fact_id) ?? [];
    current.push(vote);
    votesByFactId.set(vote.fact_id, current);
  }

  const personalitiesById = new Map(rows.personalities.map((item) => [item.id, item]));
  const factViews = rows.facts
    .map((fact) => {
      const personality = personalitiesById.get(fact.personality_id);
      if (!personality) return null;
      return buildFactView(fact, personality, votesByFactId.get(fact.id) ?? []);
    })
    .filter((item): item is FactView => item !== null)
    .sort((a, b) => b.totalVotes - a.totalVotes || a.title.localeCompare(b.title, "fr"));

  const factsByPersonality = new Map<number, FactView[]>();
  for (const fact of factViews) {
    const current = factsByPersonality.get(fact.personality.id) ?? [];
    current.push(fact);
    factsByPersonality.set(fact.personality.id, current);
  }

  const personalityViews = rows.personalities
    .map((personality) => buildPersonalityView(personality, factsByPersonality.get(personality.id) ?? []))
    .sort((a, b) => b.score - a.score || b.totalVotes - a.totalVotes);

  const summary: SiteSummary = {
    totalPersonalities: personalityViews.length,
    totalFacts: factViews.length,
    totalVotes: rows.votes.length,
    uniqueVoters: new Set(rows.votes.map((vote) => vote.fingerprint_hash)).size,
    featuredPersonalities: personalityViews.filter((item) => item.isFeatured).length,
    featuredFacts: factViews.filter((item) => item.isFeatured).length,
    pendingClaims: rows.facts.filter((item) => item.moderation_status === "pending").length,
  };

  const recentVoteRows = rows.votes
    .slice()
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));

  const votesLast7Days = rows.votes.filter(
    (vote) => +new Date(vote.updated_at) >= Date.now() - 1000 * 60 * 60 * 24 * 7,
  ).length;

  return {
    rows,
    summary,
    personalities: personalityViews,
    facts: factViews,
    recentVotes: buildRecentVotes(recentVoteRows, new Map(factViews.map((fact) => [fact.id, fact]))),
    auditLogs: buildAuditLogViews(rows.auditLogs),
    analytics: buildVisitorAnalytics(rows.visitors),
    votesLast7Days,
  };
}

function applyFactFilters(facts: FactView[], personalities: PersonalityView[], filters?: FactFilterParams) {
  const query = normalize(filters?.query ?? "");
  const category = normalize(filters?.category ?? "");
  const party = normalize(filters?.party ?? "");
  const country = normalize(filters?.country ?? "");
  const moderation = filters?.moderation ?? "";

  const personalityMap = new Map(personalities.map((personality) => [personality.id, personality]));

  return facts.filter((fact) => {
    const personality = personalityMap.get(fact.personality.id);
    if (!personality) return false;

    if (category && normalize(fact.category) !== category) return false;
    if (party && normalize(personality.party ?? "") !== party) return false;
    if (country && normalize(personality.country) !== country) return false;
    if (moderation && fact.moderationStatus !== moderation) return false;

    if (!query) return true;

    const haystack = [
      fact.title,
      fact.statement,
      fact.context,
      fact.category,
      fact.tags.join(" "),
      personality.name,
      personality.role,
      personality.party ?? "",
      personality.country,
    ]
      .join(" ")
      .toLowerCase();

    return normalize(haystack).includes(query);
  });
}

function applyPersonalityFilters(personalities: PersonalityView[], filters?: { query?: string; country?: string; party?: string }) {
  const query = normalize(filters?.query ?? "");
  const country = normalize(filters?.country ?? "");
  const party = normalize(filters?.party ?? "");

  return personalities.filter((personality) => {
    if (country && normalize(personality.country) !== country) return false;
    if (party && normalize(personality.party ?? "") !== party) return false;

    if (!query) return true;

    const haystack = [
      personality.name,
      personality.role,
      personality.summary,
      personality.country,
      personality.party ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return normalize(haystack).includes(query);
  });
}

export async function getHomepageData(): Promise<HomepageData> {
  const data = await buildData();
  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    featuredPersonality:
      data.personalities.find((item) => item.isFeatured) ?? data.personalities[0] ?? null,
    featuredFact: data.facts.find((item) => item.isFeatured) ?? data.facts[0] ?? null,
    mostReliable: data.personalities.slice(0, 4),
    leastReliable: data.personalities.slice().reverse().slice(0, 4),
    onFireFacts: data.facts.slice(0, 8),
    latestFacts: data.facts
      .slice()
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 6),
    allPersonalities: data.personalities,
    controversialFacts: data.facts
      .slice()
      .sort((a, b) => b.controversyScore - a.controversyScore || b.totalVotes - a.totalVotes)
      .slice(0, 6),
    categories: [...new Set(data.facts.map((fact) => fact.category))].sort((a, b) =>
      a.localeCompare(b, "fr"),
    ),
    countries: [...new Set(data.personalities.map((personality) => personality.country))].sort(
      (a, b) => a.localeCompare(b, "fr"),
    ),
    parties: [
      ...new Set(
        data.personalities.map((personality) => personality.party).filter(Boolean) as string[],
      ),
    ].sort((a, b) => a.localeCompare(b, "fr")),
  };
}

export async function getFactsListingData(filters?: FactFilterParams): Promise<FactsListingData> {
  const data = await buildData();
  const filtered = applyFactFilters(data.facts, data.personalities, filters);
  const pagination = paginate(filtered, filters?.page);
  const availableCategories = [...new Set(data.facts.map((fact) => fact.category))]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((category) => ({
      value: category,
      label: category,
      count: data.facts.filter((fact) => fact.category === category).length,
    }));
  const availableCountries = [...new Set(data.personalities.map((personality) => personality.country))]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((country) => ({
      value: country,
      label: country,
      count: data.personalities.filter((personality) => personality.country === country).length,
    }));
  const availableParties = [
    ...new Set(
      data.personalities.map((personality) => personality.party).filter(Boolean) as string[],
    ),
  ]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((party) => ({
      value: party,
      label: party,
      count: data.personalities.filter((personality) => personality.party === party).length,
    }));

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    items: pagination.items,
    total: pagination.total,
    page: pagination.page,
    pageCount: pagination.pageCount,
    pageSize: pagination.pageSize,
    availableCategories,
    availableCountries,
    availableParties,
    filters: {
      query: filters?.query ?? "",
      category: filters?.category ?? "",
      party: filters?.party ?? "",
      country: filters?.country ?? "",
      moderation: filters?.moderation ?? "",
      sort: filters?.sort ?? "hot",
      page: pagination.page,
    },
    pagination: {
      page: pagination.page,
      pageCount: pagination.pageCount,
      total: pagination.total,
      pageSize: pagination.pageSize,
    },
  };
}

export async function getPersonalitiesListingData(filters?: {
  query?: string;
  country?: string;
  party?: string;
  sort?: "reliable" | "votes" | "name";
}): Promise<PersonalitiesListingData> {
  const data = await buildData();
  const items = applyPersonalityFilters(data.personalities, filters);
  const availableCountries = [...new Set(data.personalities.map((personality) => personality.country))]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((country) => ({
      value: country,
      label: country,
      count: data.personalities.filter((personality) => personality.country === country).length,
    }));
  const availableParties = [
    ...new Set(
      data.personalities.map((personality) => personality.party).filter(Boolean) as string[],
    ),
  ]
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((party) => ({
      value: party,
      label: party,
      count: data.personalities.filter((personality) => personality.party === party).length,
    }));

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    items,
    availableCountries,
    availableParties,
    filters: {
      query: filters?.query ?? "",
      country: filters?.country ?? "",
      party: filters?.party ?? "",
      sort: filters?.sort ?? "reliable",
    },
  };
}

export async function getPersonalityPageData(slug: string): Promise<PersonalityPageData | null> {
  const data = await buildData();
  const personality = data.personalities.find((item) => item.slug === slug);
  if (!personality) return null;

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    personality,
    relatedFacts: personality.facts,
  };
}

export async function getFactPageData(slug: string): Promise<FactPageData | null> {
  const data = await buildData();
  const fact = data.facts.find((item) => item.slug === slug);
  if (!fact) return null;

  const personality = data.personalities.find((item) => item.id === fact.personality.id);
  if (!personality) return null;

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    fact,
    personality,
    relatedFacts: personality.facts.filter((item) => item.slug !== slug).slice(0, 4),
    voteChallenge: await getVoteChallenge(slug),
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const data = await buildData();
  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    personalities: data.personalities,
    facts: data.facts,
    topFacts: data.facts.slice(0, 8),
    featuredPersonalities: data.personalities.filter((item) => item.isFeatured),
    featuredFacts: data.facts.filter((item) => item.isFeatured),
    recentVotes: data.recentVotes,
    votesLast7Days: data.votesLast7Days,
    pendingClaims: data.summary.pendingClaims,
    visitorAnalytics: data.analytics,
    actionLogs: data.auditLogs,
    moderationQueue: data.facts.filter((fact) => fact.moderationStatus !== "approved").slice(0, 12),
  };
}

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${process.env.VOTER_SALT ?? "veridicte-default-salt"}:${value}`)
    .digest("hex");
}

function challengeAnswer(left: number, right: number) {
  return `${left + right}`;
}

function buildChallengeSeed(factSlug: string, visitorToken: string) {
  const digest = crypto
    .createHash("sha256")
    .update(`${visitorToken}:${factSlug}:${process.env.VOTER_SALT ?? "veridicte-default-salt"}`)
    .digest();
  return {
    left: (digest[0] % 7) + 2,
    right: (digest[1] % 7) + 1,
    nonce: digest.subarray(2, 8).toString("hex"),
  };
}

async function getVisitorContext(options?: { allowCookieWrite?: boolean }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const existing = cookieStore.get("veridicte_visitor")?.value;
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";
  const fallbackToken = hashValue(`visitor:${ip}|${userAgent}`).slice(0, 32);
  const visitorToken = existing ?? fallbackToken;

  if (options?.allowCookieWrite && !existing) {
    cookieStore.set("veridicte_visitor", visitorToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return {
    visitorToken,
    visitorHash: hashValue(visitorToken),
    fingerprintHash: hashValue(`${visitorToken}|${ip}|${userAgent}`),
    ipHash: hashValue(ip),
    userAgentHash: hashValue(userAgent),
  };
}

async function insertAuditLog(
  actionType: string,
  entityType: "personality" | "fact" | "vote" | "auth",
  entityId: number | null,
  entityLabel: string,
  actorLabel: string,
  metadata?: string | null,
) {
  const entry: AuditLogRow = {
    id: memoryState.auditLogs.length + 1,
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    entity_label: entityLabel,
    actor_label: actorLabel,
    metadata: metadata ?? null,
    created_at: new Date().toISOString(),
  };

  if (!hasDatabase || !sql) {
    memoryState.auditLogs.unshift(entry);
    return;
  }

  await sql`
    insert into admin_audit_logs (action_type, entity_type, entity_id, entity_label, actor_label, metadata)
    values (${actionType}, ${entityType}, ${entityId}, ${entityLabel}, ${actorLabel}, ${metadata ?? null})
  `;
}

export async function recordPageView(path: string) {
  const visitor = await getVisitorContext();
  const event: VisitorEventRow = {
    id: memoryState.visitors.length + 1,
    path,
    visitor_hash: visitor.visitorHash,
    user_agent_hash: visitor.userAgentHash,
    ip_hash: visitor.ipHash,
    created_at: new Date().toISOString(),
  };

  if (!hasDatabase || !sql) {
    memoryState.visitors.unshift(event);
    return;
  }

  await initDatabase();
  await sql`
    insert into visitor_events (path, visitor_hash, user_agent_hash, ip_hash)
    values (${path}, ${event.visitor_hash}, ${event.user_agent_hash}, ${event.ip_hash})
  `;
}

export async function getVoteChallenge(factSlug: string): Promise<VoteChallenge> {
  const visitor = await getVisitorContext();
  const seed = buildChallengeSeed(factSlug, visitor.visitorToken);
  return {
    prompt: `Combien font ${seed.left} + ${seed.right} ?`,
    nonce: seed.nonce,
    hint: "Mini verification anti-abus",
  };
}

export async function canVoteOnFact(factSlug: string) {
  const visitor = await getVisitorContext();
  const data = await buildData();
  const fact = data.facts.find((item) => item.slug === factSlug);
  if (!fact) {
    return { allowed: false, reason: "Fait introuvable." };
  }

  const rows = await getRows();
  const currentVote = rows.votes.find(
    (vote) => vote.fact_id === fact.id && vote.visitor_token === visitor.visitorToken,
  );

  if (currentVote) {
    const elapsedHours = (Date.now() - +new Date(currentVote.updated_at)) / (1000 * 60 * 60);
    if (elapsedHours < VOTE_WINDOW_HOURS) {
      return {
        allowed: false,
        reason: `Vous avez deja vote recemment pour ce fait. Nouvelle tentative possible apres ${VOTE_WINDOW_HOURS}h.`,
      };
    }
  }

  const hourlyWindow = Date.now() - 1000 * 60 * 60;
  const ipVotes = rows.votes.filter(
    (vote) => vote.ip_hash === visitor.ipHash && +new Date(vote.updated_at) >= hourlyWindow,
  );

  if (ipVotes.length >= MAX_VOTES_PER_IP_PER_HOUR) {
    return {
      allowed: false,
      reason: "Trop de votes detectes depuis cette connexion. Reessayez plus tard.",
    };
  }

  return { allowed: true, reason: null };
}

export async function prepareVoteSubmission(
  factSlug: string,
  verdict: Verdict,
  challengeNonce: string,
  challengeAnswerValue: string,
): Promise<VoteSubmissionInput> {
  const visitor = await getVisitorContext({ allowCookieWrite: true });
  return {
    factSlug,
    verdict,
    fingerprintHash: visitor.fingerprintHash,
    visitorToken: visitor.visitorToken,
    ipHash: visitor.ipHash,
    userAgentHash: visitor.userAgentHash,
    challengeNonce,
    challengeAnswerHash: hashValue(challengeAnswerValue.trim()),
  };
}

export async function submitVote(input: VoteSubmissionInput): Promise<VoteSubmissionResult> {
  const rows = await getRows();
  const fact = rows.facts.find((item) => item.slug === input.factSlug);
  if (!fact) {
    throw new Error("Fait introuvable.");
  }

  if (fact.moderation_status === "rejected") {
    throw new Error("Ce fait n'est plus ouvert au vote.");
  }

  const seed = buildChallengeSeed(input.factSlug, input.visitorToken);
  if (seed.nonce !== input.challengeNonce) {
    throw new Error("Verification anti-abus invalide.");
  }

  const expectedHash = hashValue(challengeAnswer(seed.left, seed.right));
  if (expectedHash !== input.challengeAnswerHash) {
    throw new Error("Reponse anti-abus incorrecte.");
  }

  const voteStatus = await canVoteOnFact(input.factSlug);
  if (!voteStatus.allowed) {
    throw new Error(voteStatus.reason ?? "Vote non autorise.");
  }

  const existing = rows.votes.find(
    (vote) => vote.fact_id === fact.id && vote.fingerprint_hash === input.fingerprintHash,
  );

  const newVote: VoteRow = {
    id: memoryState.votes.length + 1,
    fact_id: fact.id,
    verdict: input.verdict,
    fingerprint_hash: input.fingerprintHash,
    visitor_token: input.visitorToken,
    ip_hash: input.ipHash,
    user_agent_hash: input.userAgentHash,
    challenge_answer_hash: input.challengeAnswerHash,
    challenge_nonce: input.challengeNonce,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!hasDatabase || !sql) {
    if (existing) {
      existing.verdict = input.verdict;
      existing.updated_at = new Date().toISOString();
      existing.challenge_answer_hash = input.challengeAnswerHash;
      existing.challenge_nonce = input.challengeNonce;
    } else {
      memoryState.votes.unshift(newVote);
    }
  } else {
    await initDatabase();
    await sql`
      insert into votes (
        fact_id, verdict, fingerprint_hash, visitor_token, ip_hash, user_agent_hash,
        challenge_answer_hash, challenge_nonce
      ) values (
        ${fact.id},
        ${input.verdict},
        ${input.fingerprintHash},
        ${input.visitorToken},
        ${input.ipHash},
        ${input.userAgentHash},
        ${input.challengeAnswerHash},
        ${input.challengeNonce}
      )
      on conflict (fact_id, fingerprint_hash)
      do update set
        verdict = excluded.verdict,
        visitor_token = excluded.visitor_token,
        ip_hash = excluded.ip_hash,
        user_agent_hash = excluded.user_agent_hash,
        challenge_answer_hash = excluded.challenge_answer_hash,
        challenge_nonce = excluded.challenge_nonce,
        updated_at = now()
    `;
  }

  await insertAuditLog(
    existing ? "vote_updated" : "vote_created",
    "vote",
    fact.id,
    fact.title,
    "visitor",
    `Verdict ${input.verdict}`,
  );

  const fresh = await getFactPageData(input.factSlug);
  if (!fresh) {
    throw new Error("Impossible de recharger le fait.");
  }

  return {
    fact: fresh.fact,
    updatedExistingVote: Boolean(existing),
  };
}

export async function setFactOverride(
  factId: number,
  outcome: Verdict | null,
  actorLabel = "admin",
) {
  await initDatabase();

  if (!hasDatabase || !sql) {
    const fact = memoryState.facts.find((item) => item.id === factId);
    if (fact) {
      fact.admin_override = outcome;
      fact.updated_at = new Date().toISOString();
      await insertAuditLog("override_fact", "fact", fact.id, fact.title, actorLabel, outcome ?? "none");
    }
    return;
  }

  const [updated] = await sql<FactRow[]>`
    update facts
    set admin_override = ${outcome}, updated_at = now()
    where id = ${factId}
    returning *
  `;
  if (updated) {
    await insertAuditLog("override_fact", "fact", updated.id, updated.title, actorLabel, outcome ?? "none");
  }
}

export async function setFeatureState(
  entityType: "personality" | "fact",
  entityId: number,
  featured: boolean,
  actorLabel = "admin",
) {
  await initDatabase();

  if (!hasDatabase || !sql) {
    if (entityType === "personality") {
      const row = memoryState.personalities.find((item) => item.id === entityId);
      if (row) {
        row.is_featured = featured;
        await insertAuditLog("feature_personality", "personality", row.id, row.name, actorLabel, String(featured));
      }
      return;
    }

    const row = memoryState.facts.find((item) => item.id === entityId);
    if (row) {
      row.is_featured = featured;
      row.updated_at = new Date().toISOString();
      await insertAuditLog("feature_fact", "fact", row.id, row.title, actorLabel, String(featured));
    }
    return;
  }

  if (entityType === "personality") {
    const [row] = await sql<PersonalityRow[]>`
      update personalities
      set is_featured = ${featured}
      where id = ${entityId}
      returning *
    `;
    if (row) {
      await insertAuditLog("feature_personality", "personality", row.id, row.name, actorLabel, String(featured));
    }
    return;
  }

  const [row] = await sql<FactRow[]>`
    update facts
    set is_featured = ${featured}, updated_at = now()
    where id = ${entityId}
    returning *
  `;
  if (row) {
    await insertAuditLog("feature_fact", "fact", row.id, row.title, actorLabel, String(featured));
  }
}

export async function setFactModeration(
  factId: number,
  moderationStatus: ModerationStatus,
  moderationNote: string | null,
  actorLabel = "admin",
) {
  await initDatabase();

  if (!hasDatabase || !sql) {
    const row = memoryState.facts.find((item) => item.id === factId);
    if (row) {
      row.moderation_status = moderationStatus;
      row.moderation_note = moderationNote;
      row.updated_at = new Date().toISOString();
      await insertAuditLog(
        "moderate_fact",
        "fact",
        row.id,
        row.title,
        actorLabel,
        `${moderationStatus}${moderationNote ? ` - ${moderationNote}` : ""}`,
      );
    }
    return;
  }

  const [row] = await sql<FactRow[]>`
    update facts
    set moderation_status = ${moderationStatus},
        moderation_note = ${moderationNote},
        updated_at = now()
    where id = ${factId}
    returning *
  `;
  if (row) {
    await insertAuditLog(
      "moderate_fact",
      "fact",
      row.id,
      row.title,
      actorLabel,
      `${moderationStatus}${moderationNote ? ` - ${moderationNote}` : ""}`,
    );
  }
}

export async function createPersonality(input: CreatePersonalityInput, actorLabel = "admin") {
  await initDatabase();
  const slug = slugify(input.name);

  if (!hasDatabase || !sql) {
    const nextId = (memoryState.personalities.at(-1)?.id ?? 0) + 1;
    memoryState.personalities.push({
      id: nextId,
      slug,
      name: input.name,
      role: input.role,
      summary: input.summary,
      accent: input.accent,
      country: input.country,
      party: input.party ?? null,
      wikipedia_url: input.wikipediaUrl ?? null,
      is_featured: Boolean(input.isFeatured),
      highlight_note: input.highlightNote ?? null,
      created_at: new Date().toISOString(),
    });
    await insertAuditLog("create_personality", "personality", nextId, input.name, actorLabel, slug);
    return;
  }

  const [created] = await sql<PersonalityRow[]>`
    insert into personalities (
      slug, name, role, summary, accent, country, party, wikipedia_url, is_featured, highlight_note
    ) values (
      ${slug},
      ${input.name},
      ${input.role},
      ${input.summary},
      ${input.accent},
      ${input.country},
      ${input.party ?? null},
      ${input.wikipediaUrl ?? null},
      ${Boolean(input.isFeatured)},
      ${input.highlightNote ?? null}
    )
    returning *
  `;
  if (created) {
    await insertAuditLog("create_personality", "personality", created.id, created.name, actorLabel, created.slug);
  }
}

export async function createFact(input: CreateFactInput, actorLabel = "admin") {
  await initDatabase();
  const rows = await getRows();
  const personality = rows.personalities.find((item) => item.slug === input.personalitySlug);
  if (!personality) {
    throw new Error("Personnalite introuvable.");
  }

  const slug = slugify(`${input.personalitySlug}-${input.title}`);

  if (!hasDatabase || !sql) {
    const nextId = (memoryState.facts.at(-1)?.id ?? 0) + 1;
    memoryState.facts.unshift({
      id: nextId,
      personality_id: personality.id,
      slug,
      title: input.title,
      statement: input.statement,
      context: input.context,
      category: input.category,
      source_label: input.sourceLabel ?? null,
      source_url: input.sourceUrl ?? null,
      admin_override: null,
      moderation_status: input.moderationStatus ?? "pending",
      moderation_note: input.moderationNote ?? null,
      is_featured: Boolean(input.isFeatured),
      highlight_note: input.highlightNote ?? null,
      tags: input.tags,
      happened_at: input.happenedAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await insertAuditLog("create_fact", "fact", nextId, input.title, actorLabel, slug);
    return;
  }

  const [created] = await sql<FactRow[]>`
    insert into facts (
      personality_id, slug, title, statement, context, category, source_label, source_url,
      admin_override, moderation_status, moderation_note, is_featured, highlight_note, tags, happened_at
    ) values (
      ${personality.id},
      ${slug},
      ${input.title},
      ${input.statement},
      ${input.context},
      ${input.category},
      ${input.sourceLabel ?? null},
      ${input.sourceUrl ?? null},
      ${null},
      ${input.moderationStatus ?? "pending"},
      ${input.moderationNote ?? null},
      ${Boolean(input.isFeatured)},
      ${input.highlightNote ?? null},
      ${input.tags},
      ${input.happenedAt}
    )
    returning *
  `;
  if (created) {
    await insertAuditLog("create_fact", "fact", created.id, created.title, actorLabel, created.slug);
  }
}

export function getVoteWindowHours() {
  return VOTE_WINDOW_HOURS;
}
