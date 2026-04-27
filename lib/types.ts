export const VERDICTS = ["true", "false", "unverifiable"] as const;

export type Verdict = (typeof VERDICTS)[number];

export type StorageMode = "postgresql" | "demo-memory";

export type VoteCounts = Record<Verdict, number>;
export type VerdictPercentages = Record<Verdict, number>;

export interface PersonalitySeed {
  slug: string;
  name: string;
  role: string;
  summary: string;
  accent: string;
  country?: string;
  party?: string;
  isFeatured?: boolean;
  highlightNote?: string | null;
}

export interface FactSeed {
  slug: string;
  personalitySlug: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  happenedAt: string;
  tags: string[];
  adminOverride?: Verdict | null;
  isFeatured?: boolean;
  highlightNote?: string | null;
  seedVotes?: VoteCounts;
}

export interface PersonalityRow {
  id: number;
  slug: string;
  name: string;
  role: string;
  summary: string;
  accent: string;
  is_featured: boolean;
  highlight_note: string | null;
  created_at: string;
}

export interface FactRow {
  id: number;
  personality_id: number;
  slug: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  source_label: string | null;
  source_url: string | null;
  admin_override: Verdict | null;
  is_featured: boolean;
  highlight_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoteRow {
  id: number;
  fact_id: number;
  verdict: Verdict;
  fingerprint_hash: string;
  visitor_token: string;
  ip_hash: string;
  user_agent_hash: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalitySnippet {
  id: number;
  slug: string;
  name: string;
  role: string;
  accent: string;
}

export interface FactView {
  id: number;
  slug: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
  adminOverride: Verdict | null;
  isFeatured: boolean;
  highlightNote: string | null;
  createdAt: string;
  updatedAt: string;
  totalVotes: number;
  counts: VoteCounts;
  percentages: VerdictPercentages;
  crowdPercentages: VerdictPercentages;
  crowdWinner: Verdict | null;
  finalVerdict: Verdict | null;
  credibilityScore: number;
  personality: PersonalitySnippet;
}

export interface PersonalityView {
  id: number;
  slug: string;
  name: string;
  role: string;
  accent: string;
  summary: string;
  isFeatured: boolean;
  highlightNote: string | null;
  createdAt: string;
  totalVotes: number;
  score: number;
  reliabilityLabel: string;
  factCount: number;
  factVerdicts: VoteCounts;
  facts: FactView[];
}

export interface SiteSummary {
  totalPersonalities: number;
  totalFacts: number;
  totalVotes: number;
  uniqueVoters: number;
}

export interface HomepageData {
  storageMode: StorageMode;
  summary: SiteSummary;
  featuredPersonality: PersonalityView | null;
  featuredFact: FactView | null;
  mostReliable: PersonalityView[];
  leastReliable: PersonalityView[];
  onFireFacts: FactView[];
  latestFacts?: FactView[];
  allPersonalities: PersonalityView[];
}

export interface PersonalityPageData {
  storageMode: StorageMode;
  personality: PersonalityView;
  relatedFacts: FactView[];
}

export interface FactPageData {
  storageMode: StorageMode;
  fact: FactView;
  personality: PersonalityView;
  relatedFacts: FactView[];
}

export interface RecentVoteView {
  id: number;
  verdict: Verdict;
  updatedAt: string;
  factSlug: string;
  factTitle: string;
  personalityName: string;
}

export interface AdminDashboardData {
  storageMode: StorageMode;
  summary: SiteSummary;
  personalities: PersonalityView[];
  facts: FactView[];
  topFacts?: FactView[];
  featuredPersonalities: PersonalityView[];
  featuredFacts: FactView[];
  recentVotes: RecentVoteView[];
  votesLast7Days?: number;
  pendingClaims?: number;
}

export interface VoteSubmissionInput {
  factSlug: string;
  verdict: Verdict;
  fingerprintHash: string;
  visitorToken: string;
  ipHash: string;
  userAgentHash: string;
}

export interface VoteSubmissionResult {
  fact: FactView;
  updatedExistingVote: boolean;
}

export interface CreatePersonalityInput {
  name: string;
  role: string;
  summary: string;
  accent: string;
  highlightNote?: string | null;
  isFeatured?: boolean;
}

export interface CreateFactInput {
  personalitySlug: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  highlightNote?: string | null;
  isFeatured?: boolean;
}
