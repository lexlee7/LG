export const VERDICTS = ["true", "false", "unverifiable"] as const;

export type Verdict = (typeof VERDICTS)[number];

export type StorageMode = "postgresql" | "demo-memory";

export interface PersonalitySeed {
  slug: string;
  name: string;
  role: string;
  country: string;
  party?: string;
  bio: string;
  accent: string;
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
  sourceLabel: string;
  sourceUrl?: string | null;
  happenedAt: string;
  tags: string[];
  adminOverride?: Verdict | null;
  isFeatured?: boolean;
  highlightNote?: string | null;
}

export interface VoteDistribution {
  truePct: number;
  falsePct: number;
  unverifiablePct: number;
}

export interface PersonalitySummary {
  id: string;
  slug: string;
  name: string;
  role: string;
  country: string;
  party?: string | null;
  bio: string;
  accent: string;
  isFeatured: boolean;
  highlightNote?: string | null;
  reliabilityScore: number;
  factCount: number;
  totalVotes: number;
  trueCount: number;
  falseCount: number;
  unverifiableCount: number;
}

export interface FactWithStats {
  id: string;
  slug: string;
  personalityId: string;
  personalitySlug: string;
  personalityName: string;
  personalityRole: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel: string;
  sourceUrl?: string | null;
  happenedAt: string;
  tags: string[];
  adminOverride?: Verdict | null;
  isFeatured: boolean;
  highlightNote?: string | null;
  totalVotes: number;
  trueVotes: number;
  falseVotes: number;
  unverifiableVotes: number;
  distribution: VoteDistribution;
  crowdOutcome: Verdict;
  effectiveOutcome: Verdict;
  credibilityScore: number;
  lastVoteAt?: string | null;
}

export interface SiteSummary {
  totalPersonalities: number;
  totalFacts: number;
  totalVotes: number;
  uniqueVoters: number;
  featuredPersonalities: number;
  featuredFacts: number;
}

export interface HomepageData {
  storageMode: StorageMode;
  summary: SiteSummary;
  featuredPersonality: PersonalitySummary | null;
  featuredFact: FactWithStats | null;
  mostReliable: PersonalitySummary[];
  leastReliable: PersonalitySummary[];
  onFireFacts: FactWithStats[];
  latestFacts: FactWithStats[];
  allPersonalities: PersonalitySummary[];
}

export interface PersonalityPageData {
  storageMode: StorageMode;
  personality: PersonalitySummary;
  facts: FactWithStats[];
}

export interface FactPageData {
  storageMode: StorageMode;
  fact: FactWithStats;
  personality: PersonalitySummary;
  relatedFacts: FactWithStats[];
}

export interface RecentVoteItem {
  verdict: Verdict;
  updatedAt: string;
  factSlug: string;
  factTitle: string;
  personalityName: string;
}

export interface AdminDashboardData {
  storageMode: StorageMode;
  summary: SiteSummary;
  personalities: PersonalitySummary[];
  facts: FactWithStats[];
  topFacts: FactWithStats[];
  featuredPersonalities: PersonalitySummary[];
  featuredFacts: FactWithStats[];
  recentVotes: RecentVoteItem[];
  votesLast7Days: number;
  pendingClaims: number;
}

export interface VoteSubmissionInput {
  factSlug: string;
  verdict: Verdict;
  fingerprintHash: string;
  visitorToken: string;
  ipHash: string;
  userAgentHash: string;
}
