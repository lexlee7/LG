"use server";

import crypto from "node:crypto";

import { cookies, headers } from "next/headers";

import { hasDatabase, sql } from "@/lib/db";
import { factSeeds, personalitySeeds } from "@/lib/sample-data";
import type {
  AdminDashboardData,
  CreateFactInput,
  CreatePersonalityInput,
  FactPageData,
  FactRow,
  FactSeed,
  FactView,
  HomepageData,
  PersonalityPageData,
  PersonalityRow,
  PersonalitySeed,
  PersonalitySnippet,
  PersonalityView,
  RecentVoteView,
  SiteSummary,
  Verdict,
  VerdictPercentages,
  VoteCounts,
  VoteRow,
  VoteSubmissionInput,
  VoteSubmissionResult,
} from "@/lib/types";

const VOTE_WINDOW_HOURS = Number(process.env.VOTE_COOLDOWN_HOURS ?? "24");

type MemoryState = {
  initialized: boolean;
  personalities: PersonalityRow[];
  facts: FactRow[];
  votes: VoteRow[];
};

const memoryState: MemoryState = {
  initialized: false,
  personalities: [],
  facts: [],
  votes: [],
};

function stableId(seed: string) {
  return crypto.createHash("sha1").update(seed).digest("hex").slice(0, 14);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildPersonalityRow(seed: PersonalitySeed): PersonalityRow {
  return {
    id: stableId(`personality:${seed.slug}`),
    slug: seed.slug,
    name: seed.name,
    role: seed.role,
    summary: seed.summary,
    accent: seed.accent,
    is_featured: Boolean(seed.isFeatured),
    highlight_note: seed.highlightNote ?? null,
    created_at: new Date("2026-01-05").toISOString(),
  };
}

function buildFactRow(seed: FactSeed, personalityId: number | string): FactRow {
  return {
    id: Number.parseInt(stableId(`fact:${seed.personalitySlug}:${seed.slug}`).slice(0, 10), 16),
    personality_id: Number(personalityId),
    slug: seed.slug,
    title: seed.title,
    statement: seed.statement,
    context: seed.context,
    category: seed.category,
    source_label: seed.sourceLabel ?? null,
    source_url: seed.sourceUrl ?? null,
    admin_override: seed.adminOverride ?? null,
    is_featured: Boolean(seed.isFeatured),
    highlight_note: seed.highlightNote ?? null,
    created_at: new Date("2026-01-15").toISOString(),
    updated_at: new Date("2026-04-15").toISOString(),
  };
}

function emptyCounts(): VoteCounts {
  return {
    true: 0,
    false: 0,
    unverifiable: 0,
  };
}

function percentagesFromCounts(counts: VoteCounts): VerdictPercentages {
  const total = counts.true + counts.false + counts.unverifiable;
  if (!total) {
    return { true: 0, false: 0, unverifiable: 0 };
  }
  return {
    true: Math.round((counts.true / total) * 100),
    false: Math.round((counts.false / total) * 100),
    unverifiable: Math.max(
      0,
      100 - Math.round((counts.true / total) * 100) - Math.round((counts.false / total) * 100),
    ),
  };
}

function resolveWinner(counts: VoteCounts): Verdict | null {
  const ordered = (["true", "false", "unverifiable"] as const)
    .map((verdict) => ({ verdict, value: counts[verdict] }))
    .sort((a, b) => b.value - a.value);

  if (ordered[0].value === 0) {
    return null;
  }

  return ordered[0].verdict;
}

function scoreFromPercentages(percentages: VerdictPercentages) {
  return Math.max(0, Math.min(100, percentages.true + percentages.unverifiable * 0.5));
}

function reliabilityLabel(score: number) {
  if (score >= 75) return "Tres fiable";
  if (score >= 55) return "Plutot fiable";
  if (score >= 40) return "Disputee";
  return "Fragile";
}

function cloneRow<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seededVotes(
  factId: number,
  counts: VoteCounts,
  offset: number,
): VoteRow[] {
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
    created_at: new Date(Date.now() - index * 1000 * 60 * 37).toISOString(),
    updated_at: new Date(Date.now() - index * 1000 * 60 * 37).toISOString(),
  }));
}

function ensureMemoryBootstrapped() {
  if (memoryState.initialized) {
    return;
  }

  const personalities = personalitySeeds.map(buildPersonalityRow);
  const bySlug = new Map(personalities.map((person, index) => [person.slug, index + 1]));

  memoryState.personalities = personalities.map((person, index) => ({
    ...person,
    id: index + 1,
  }));

  let voteOffset = 0;
  memoryState.facts = [];
  memoryState.votes = [];

  for (const seed of factSeeds) {
    const personalityId = bySlug.get(seed.personalitySlug);
    if (!personalityId) {
      continue;
    }

    const fact = buildFactRow(seed, personalityId);
    memoryState.facts.push(fact);

    const presetCounts = presetVoteCounts(seed.slug);
    const votes = seededVotes(fact.id, presetCounts, voteOffset);
    voteOffset += votes.length;
    memoryState.votes.push(...votes);
  }

  memoryState.initialized = true;
}

function presetVoteCounts(slug: string): VoteCounts {
  const table: Record<string, VoteCounts> = {
    "renovation-500000-logements": { true: 162, false: 28, unverifiable: 31 },
    "baisse-prix-electricite-30": { true: 40, false: 72, unverifiable: 111 },
    "deficit-divise-par-deux": { true: 18, false: 160, unverifiable: 24 },
    "creation-200000-emplois": { true: 71, false: 49, unverifiable: 88 },
    "demarches-divisees-par-trois": { true: 154, false: 22, unverifiable: 17 },
    "hausse-prelevements-zero": { true: 13, false: 177, unverifiable: 16 },
    "crimes-baisse-40": { true: 21, false: 141, unverifiable: 18 },
    "bus-gratuits-etudiants": { true: 66, false: 29, unverifiable: 93 },
    "espaces-verts-double": { true: 121, false: 12, unverifiable: 15 },
  };

  return table[slug] ?? { true: 30, false: 30, unverifiable: 30 };
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
        is_featured boolean not null default false,
        highlight_note text,
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
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (fact_id, fingerprint_hash)
      )
    `;

    for (const seed of personalitySeeds) {
      await tx`
        insert into personalities (slug, name, role, summary, accent, is_featured, highlight_note)
        values (
          ${seed.slug},
          ${seed.name},
          ${seed.role},
          ${seed.summary},
          ${seed.accent},
          ${Boolean(seed.isFeatured)},
          ${seed.highlightNote ?? null}
        )
        on conflict (slug) do nothing
      `;
    }

    const personalities = await tx<PersonalityRow[]>`
      select * from personalities order by id asc
    `;
    const bySlug = new Map(personalities.map((row) => [row.slug, row.id]));

    for (const seed of factSeeds) {
      const personalityId = bySlug.get(seed.personalitySlug);
      if (!personalityId) continue;

      await tx`
        insert into facts (
          personality_id, slug, title, statement, context, category, source_label, source_url,
          admin_override, is_featured, highlight_note
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
          ${Boolean(seed.isFeatured)},
          ${seed.highlightNote ?? null}
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
      personalities: cloneRow(memoryState.personalities),
      facts: cloneRow(memoryState.facts),
      votes: cloneRow(memoryState.votes),
    };
  }

  const [personalities, facts, votes] = await Promise.all([
    sql<PersonalityRow[]>`select * from personalities order by name asc`,
    sql<FactRow[]>`select * from facts order by created_at desc, id desc`,
    sql<VoteRow[]>`select * from votes order by updated_at desc, id desc`,
  ]);

  return { personalities, facts, votes };
}

function buildPersonalitySnippet(row: PersonalityRow): PersonalitySnippet {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
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

  const crowdPercentages = percentagesFromCounts(counts);
  const percentages =
    fact.admin_override === null
      ? crowdPercentages
      : {
          true: fact.admin_override === "true" ? 100 : 0,
          false: fact.admin_override === "false" ? 100 : 0,
          unverifiable: fact.admin_override === "unverifiable" ? 100 : 0,
        };

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
    isFeatured: fact.is_featured,
    highlightNote: fact.highlight_note,
    createdAt: fact.created_at,
    updatedAt: fact.updated_at,
    totalVotes: votes.length,
    counts,
    percentages,
    crowdPercentages,
    crowdWinner: resolveWinner(counts),
    finalVerdict: fact.admin_override ?? resolveWinner(counts),
    credibilityScore: scoreFromPercentages(percentages),
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

  const verdicts = facts.reduce<VoteCounts>((acc, fact) => {
    const finalVerdict = fact.finalVerdict;
    if (finalVerdict) {
      acc[finalVerdict] += 1;
    }
    return acc;
  }, emptyCounts());

  return {
    id: personality.id,
    slug: personality.slug,
    name: personality.name,
    role: personality.role,
    accent: personality.accent,
    summary: personality.summary,
    isFeatured: personality.is_featured,
    highlightNote: personality.highlight_note,
    createdAt: personality.created_at,
    totalVotes,
    score,
    reliabilityLabel: reliabilityLabel(score),
    factCount: facts.length,
    factVerdicts: verdicts,
    facts: facts
      .slice()
      .sort((a, b) => b.totalVotes - a.totalVotes || a.title.localeCompare(b.title, "fr")),
  };
}

function recentVotesToView(
  rows: VoteRow[],
  factById: Map<number, FactView>,
): RecentVoteView[] {
  return rows.slice(0, 14).map((vote) => {
    const fact = factById.get(vote.fact_id);
    return {
      id: vote.id,
      verdict: vote.verdict,
      updatedAt: vote.updated_at,
      factSlug: fact?.slug ?? "inconnu",
      factTitle: fact?.title ?? "Fait supprime",
      personalityName: fact?.personality.name ?? "Personnalite inconnue",
    };
  });
}

async function buildData() {
  const { personalities, facts, votes } = await getRows();
  const votesByFactId = new Map<number, VoteRow[]>();

  for (const vote of votes) {
    const current = votesByFactId.get(vote.fact_id) ?? [];
    current.push(vote);
    votesByFactId.set(vote.fact_id, current);
  }

  const personalityById = new Map(personalities.map((person) => [person.id, person]));
  const factViews = facts
    .map((fact) => {
      const personality = personalityById.get(fact.personality_id);
      if (!personality) return null;
      return buildFactView(fact, personality, votesByFactId.get(fact.id) ?? []);
    })
    .filter((value): value is FactView => value !== null);

  const factsByPersonalityId = new Map<number, FactView[]>();
  for (const fact of factViews) {
    const current = factsByPersonalityId.get(fact.personality.id) ?? [];
    current.push(fact);
    factsByPersonalityId.set(fact.personality.id, current);
  }

  const personalityViews = personalities
    .map((personality) => buildPersonalityView(personality, factsByPersonalityId.get(personality.id) ?? []))
    .sort((a, b) => b.score - a.score || b.totalVotes - a.totalVotes);

  const summary: SiteSummary = {
    totalPersonalities: personalityViews.length,
    totalFacts: factViews.length,
    totalVotes: votes.length,
    uniqueVoters: new Set(votes.map((vote) => vote.fingerprint_hash)).size,
  };

  return {
    summary,
    personalities: personalityViews,
    facts: factViews.sort((a, b) => b.totalVotes - a.totalVotes || a.title.localeCompare(b.title, "fr")),
    recentVotes: recentVotesToView(
      votes.slice().sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)),
      new Map(factViews.map((fact) => [fact.id, fact])),
    ),
  };
}

export async function getHomepageData(): Promise<HomepageData> {
  const data = await buildData();
  const featuredPersonality = data.personalities.find((person) => person.isFeatured) ?? data.personalities[0] ?? null;
  const featuredFact = data.facts.find((fact) => fact.isFeatured) ?? data.facts[0] ?? null;

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    featuredPersonality,
    featuredFact,
    mostReliable: data.personalities.slice(0, 3),
    leastReliable: data.personalities.slice().reverse().slice(0, 3),
    onFireFacts: data.facts.slice(0, 6),
    allPersonalities: data.personalities,
  };
}

export async function getPersonalityPageData(slug: string): Promise<PersonalityPageData | null> {
  const data = await buildData();
  const personality = data.personalities.find((item) => item.slug === slug);
  if (!personality) {
    return null;
  }

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    personality,
    relatedFacts: personality.facts,
  };
}

export async function getFactPageData(slug: string): Promise<FactPageData | null> {
  const data = await buildData();
  const fact = data.facts.find((item) => item.slug === slug);
  if (!fact) {
    return null;
  }

  const personality = data.personalities.find((item) => item.id === fact.personality.id);
  if (!personality) {
    return null;
  }

  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    fact,
    personality,
    siblingFacts: personality.facts.filter((item) => item.slug !== slug).slice(0, 3),
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const data = await buildData();
  return {
    storageMode: hasDatabase ? "postgresql" : "demo-memory",
    summary: data.summary,
    personalities: data.personalities,
    facts: data.facts,
    featuredPersonalities: data.personalities.filter((item) => item.isFeatured),
    featuredFacts: data.facts.filter((item) => item.isFeatured),
    recentVotes: data.recentVotes,
  };
}

function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${process.env.VOTER_SALT ?? "veridicte-default-salt"}:${value}`)
    .digest("hex");
}

async function getVisitorContext() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const existing = cookieStore.get("veridicte_visitor");
  const visitorToken = existing?.value ?? crypto.randomUUID();

  if (!existing?.value) {
    cookieStore.set("veridicte_visitor", visitorToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  const userAgent = headerStore.get("user-agent") ?? "unknown";

  return {
    visitorToken,
    fingerprintHash: hashValue(`${visitorToken}|${ip}|${userAgent}`),
    ipHash: hashValue(ip),
    userAgentHash: hashValue(userAgent),
  };
}

export async function canVoteOnFact(factSlug: string) {
  const { visitorToken } = await getVisitorContext();
  const data = await buildData();
  const fact = data.facts.find((item) => item.slug === factSlug);

  if (!fact) {
    return { allowed: false, reason: "Fait introuvable." };
  }

  const rows = await getRows();
  const existing = rows.votes.find((vote) => vote.fact_id === fact.id && vote.visitor_token === visitorToken);

  if (!existing) {
    return { allowed: true, reason: null };
  }

  const elapsedHours = (Date.now() - +new Date(existing.updated_at)) / (1000 * 60 * 60);
  if (elapsedHours >= VOTE_WINDOW_HOURS) {
    return { allowed: true, reason: null };
  }

  return {
    allowed: false,
    reason: `Vous avez deja vote recemment pour ce fait. Nouvelle tentative possible apres ${VOTE_WINDOW_HOURS}h.`,
  };
}

export async function submitVote(input: VoteSubmissionInput): Promise<VoteSubmissionResult> {
  const rows = await getRows();
  const fact = rows.facts.find((item) => item.slug === input.factSlug);
  if (!fact) {
    throw new Error("Fait introuvable.");
  }

  const existing = rows.votes.find(
    (vote) => vote.fact_id === fact.id && vote.fingerprint_hash === input.fingerprintHash,
  );

  if (existing) {
    const elapsedHours = (Date.now() - +new Date(existing.updated_at)) / (1000 * 60 * 60);
    if (elapsedHours < VOTE_WINDOW_HOURS) {
      throw new Error(
        `Vous avez deja vote pour ce fait il y a moins de ${VOTE_WINDOW_HOURS} heures.`,
      );
    }
  }

  if (!hasDatabase || !sql) {
    if (existing) {
      existing.verdict = input.verdict;
      existing.updated_at = new Date().toISOString();
    } else {
      memoryState.votes.unshift({
        id: memoryState.votes.length + 1,
        fact_id: fact.id,
        verdict: input.verdict,
        fingerprint_hash: input.fingerprintHash,
        visitor_token: input.visitorToken,
        ip_hash: input.ipHash,
        user_agent_hash: input.userAgentHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  } else {
    await sql`
      insert into votes (
        fact_id, verdict, fingerprint_hash, visitor_token, ip_hash, user_agent_hash
      ) values (
        ${fact.id},
        ${input.verdict},
        ${input.fingerprintHash},
        ${input.visitorToken},
        ${input.ipHash},
        ${input.userAgentHash}
      )
      on conflict (fact_id, fingerprint_hash)
      do update set
        verdict = excluded.verdict,
        visitor_token = excluded.visitor_token,
        ip_hash = excluded.ip_hash,
        user_agent_hash = excluded.user_agent_hash,
        updated_at = now()
    `;
  }

  const fresh = await getFactPageData(input.factSlug);
  if (!fresh) {
    throw new Error("Impossible de recharger le fait.");
  }

  return {
    fact: fresh.fact,
    updatedExistingVote: Boolean(existing),
  };
}

export async function prepareVoteSubmission(factSlug: string, verdict: Verdict): Promise<VoteSubmissionInput> {
  const visitor = await getVisitorContext();
  return {
    factSlug,
    verdict,
    fingerprintHash: visitor.fingerprintHash,
    visitorToken: visitor.visitorToken,
    ipHash: visitor.ipHash,
    userAgentHash: visitor.userAgentHash,
  };
}

export async function setFactOverride(factId: number, outcome: Verdict | null) {
  await initDatabase();

  if (!hasDatabase || !sql) {
    const fact = memoryState.facts.find((item) => item.id === factId);
    if (fact) {
      fact.admin_override = outcome;
      fact.updated_at = new Date().toISOString();
    }
    return;
  }

  await sql`
    update facts
    set admin_override = ${outcome}, updated_at = now()
    where id = ${factId}
  `;
}

export async function setFeatureState(
  entityType: "personality" | "fact",
  entityId: number,
  featured: boolean,
) {
  await initDatabase();

  if (!hasDatabase || !sql) {
    if (entityType === "personality") {
      const row = memoryState.personalities.find((item) => item.id === entityId);
      if (row) row.is_featured = featured;
      return;
    }

    const row = memoryState.facts.find((item) => item.id === entityId);
    if (row) {
      row.is_featured = featured;
      row.updated_at = new Date().toISOString();
    }
    return;
  }

  if (entityType === "personality") {
    await sql`
      update personalities
      set is_featured = ${featured}
      where id = ${entityId}
    `;
    return;
  }

  await sql`
    update facts
    set is_featured = ${featured}, updated_at = now()
    where id = ${entityId}
  `;
}

export async function createPersonality(input: CreatePersonalityInput) {
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
      is_featured: Boolean(input.isFeatured),
      highlight_note: input.highlightNote ?? null,
      created_at: new Date().toISOString(),
    });
    return;
  }

  await sql`
    insert into personalities (slug, name, role, summary, accent, is_featured, highlight_note)
    values (
      ${slug},
      ${input.name},
      ${input.role},
      ${input.summary},
      ${input.accent},
      ${Boolean(input.isFeatured)},
      ${input.highlightNote ?? null}
    )
  `;
}

export async function createFact(input: CreateFactInput) {
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
      is_featured: Boolean(input.isFeatured),
      highlight_note: input.highlightNote ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return;
  }

  await sql`
    insert into facts (
      personality_id, slug, title, statement, context, category, source_label, source_url,
      admin_override, is_featured, highlight_note
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
      ${Boolean(input.isFeatured)},
      ${input.highlightNote ?? null}
    )
  `;
}

export function getVoteWindowHours() {
  return VOTE_WINDOW_HOURS;
}
