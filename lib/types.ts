export const VERDICTS = ["true", "false", "unverifiable"] as const;

export type Verdict = (typeof VERDICTS)[number];
export type FactStatus = Verdict;
export type StorageMode = "postgresql" | "demo-memory";
export type ModerationStatus = "draft" | "pending" | "approved" | "rejected";
export type FactSort = "hot" | "newest" | "reliable" | "controversial";
export type PersonalitySort = "reliable" | "votes" | "name";

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
  wikipediaUrl?: string | null;
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
  moderationStatus?: ModerationStatus;
  moderationNote?: string | null;
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
  country: string;
  party: string | null;
  wikipedia_url: string | null;
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
  happened_at: string;
  tags: string[];
  admin_override: Verdict | null;
  moderation_status: ModerationStatus;
  moderation_note: string | null;
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
  challenge_answer_hash: string;
  challenge_nonce: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalitySnippet {
  id: number;
  slug: string;
  name: string;
  role: string;
  country: string;
  party: string | null;
  wikipediaUrl: string | null;
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
  happenedAt: string;
  tags: string[];
  adminOverride: Verdict | null;
  moderationStatus: ModerationStatus;
  moderationNote: string | null;
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
  controversyScore: number;
  personality: PersonalitySnippet;
}

export interface PersonalityView {
  id: number;
  slug: string;
  name: string;
  role: string;
  accent: string;
  summary: string;
  country: string;
  party: string | null;
  wikipediaUrl: string | null;
  isFeatured: boolean;
  highlightNote: string | null;
  createdAt: string;
  totalVotes: number;
  score: number;
  reliabilityLabel: string;
  factCount: number;
  factVerdicts: VoteCounts;
  reliabilityHistory: Array<{
    date: string;
    label: string;
    value: number;
  }>;
  facts: FactView[];
}

export interface SiteSummary {
  totalPersonalities: number;
  totalFacts: number;
  totalVotes: number;
  uniqueVoters: number;
  featuredPersonalities: number;
  featuredFacts: number;
  pendingClaims: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface RecentVoteView {
  id: number;
  verdict: Verdict;
  updatedAt: string;
  factSlug: string;
  factTitle: string;
  personalityName: string;
}

export interface AdminActionLogView {
  id: number;
  actionType: string;
  entityType: string;
  entityId: number | null;
  entityLabel: string;
  actorLabel: string;
  metadata: string | null;
  createdAt: string;
}

export interface VisitorAnalytics {
  pageViewsLast7Days: number;
  uniqueVisitorsLast7Days: number;
  topPaths: Array<{ path: string; views: number }>;
  bounceRateEstimate: number;
}

export interface VoteTimelinePoint {
  date: string;
  label: string;
  totalVotes: number;
  trueVotes: number;
  falseVotes: number;
  unverifiableVotes: number;
}

export interface PersonalityTimelinePoint {
  date: string;
  label: string;
  value: number;
}

export interface ReliabilityHistoryPoint {
  date: string;
  label: string;
  value: number;
}

export interface PersonalitySubmissionView {
  id: number;
  name: string;
  role: string;
  summary: string;
  country: string;
  party: string | null;
  wikipediaUrl: string | null;
  sourceLabel: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface FactSubmissionView {
  id: number;
  personalitySlug: string;
  personalityName: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
  happenedAt: string;
  tags: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface HomepageData {
  storageMode: StorageMode;
  summary: SiteSummary;
  featuredPersonality: PersonalityView | null;
  featuredFact: FactView | null;
  mostReliable: PersonalityView[];
  leastReliable: PersonalityView[];
  onFireFacts: FactView[];
  latestFacts: FactView[];
  controversialFacts: FactView[];
  allPersonalities: PersonalityView[];
  categories: string[];
  countries: string[];
  parties: string[];
}

export interface FactFilterParams {
  query?: string;
  category?: string;
  country?: string;
  party?: string;
  moderation?: ModerationStatus | "";
  sort?: FactSort;
  page?: number;
}

export interface FactsListingData {
  storageMode: StorageMode;
  summary: SiteSummary;
  items: FactView[];
  availableCategories: FilterOption[];
  availableCountries: FilterOption[];
  availableParties: FilterOption[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  filters: {
    query: string;
    category: string;
    country: string;
    party: string;
    moderation: ModerationStatus | "";
    sort: FactSort;
    page: number;
  };
  pagination: {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
  };
}

export interface PersonalitiesListingData {
  storageMode: StorageMode;
  summary: SiteSummary;
  items: PersonalityView[];
  availableCountries: FilterOption[];
  availableParties: FilterOption[];
  filters: {
    query: string;
    country: string;
    party: string;
    sort: PersonalitySort;
  };
}

export interface PersonalityPageData {
  storageMode: StorageMode;
  personality: PersonalityView;
  relatedFacts: FactView[];
  reliabilityHistory: PersonalityTimelinePoint[];
}

export interface FactPageData {
  storageMode: StorageMode;
  fact: FactView;
  personality: PersonalityView;
  relatedFacts: FactView[];
  voteChallenge: VoteChallenge;
}

export interface VoteChallenge {
  prompt: string;
  nonce: string;
  hint: string;
}

export interface VoteAvailability {
  allowed: boolean;
  reason: string | null;
}

export interface AdminDashboardData {
  storageMode: StorageMode;
  summary: SiteSummary;
  personalities: PersonalityView[];
  facts: FactView[];
  topFacts: FactView[];
  featuredPersonalities: PersonalityView[];
  featuredFacts: FactView[];
  recentVotes: RecentVoteView[];
  votesLast7Days: number;
  pendingClaims: number;
  visitorAnalytics: VisitorAnalytics;
  voteTimeline: VoteTimelinePoint[];
  actionLogs: AdminActionLogView[];
  moderationQueue: FactView[];
  reliabilityByPersonality: Array<{
    personality: PersonalityView;
    history: PersonalityTimelinePoint[];
  }>;
  personalityTable: PersonalityTableRow[];
  submissionQueue: {
    personalities: PersonalitySubmissionView[];
    facts: FactSubmissionView[];
  };
  personalityImportPreview: ImportPreview;
  factImportPreview: ImportPreview;
}

export interface VoteSubmissionInput {
  factSlug: string;
  verdict: Verdict;
  fingerprintHash: string;
  visitorToken: string;
  ipHash: string;
  userAgentHash: string;
  challengeNonce: string;
  challengeAnswerHash: string;
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
  country: string;
  party?: string | null;
  wikipediaUrl?: string | null;
  highlightNote?: string | null;
  isFeatured?: boolean;
}

export interface UpdatePersonalityInput {
  id: number;
  name: string;
  role: string;
  summary: string;
  country: string;
  party?: string | null;
  wikipediaUrl?: string | null;
}

export interface PersonalityTableRow {
  id: number;
  slug: string;
  name: string;
  role: string;
  country: string;
  party: string;
  wikipediaUrl: string;
  isFeatured: boolean;
  score: number;
}

export interface CreateFactInput {
  personalitySlug: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  happenedAt: string;
  tags: string[];
  moderationStatus?: ModerationStatus;
  moderationNote?: string | null;
  highlightNote?: string | null;
  isFeatured?: boolean;
}

export interface PersonalitySubmissionInput {
  name: string;
  role: string;
  summary: string;
  country: string;
  party?: string | null;
  wikipediaUrl?: string | null;
  sourceLabel?: string | null;
}

export interface FactSubmissionInput {
  personalitySlug: string;
  personalityName: string;
  title: string;
  statement: string;
  context: string;
  category: string;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  happenedAt: string;
  tags: string[];
}

export interface PublicContributionPageData {
  availablePersonalities: Array<{ id: number; slug: string; name: string }>;
  recentSubmissions: Array<{
    id: number;
    title: string;
    kind: "personality" | "fact";
    createdAt: string;
    status: "pending" | "approved" | "rejected";
  }>;
}

export interface ImportPreview {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  rows: string[][];
}

export interface CsvImportReport {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  rows: string[][];
}
