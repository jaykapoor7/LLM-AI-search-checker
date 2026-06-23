// ─────────────────────────────────────────────────────────────────────────────
// LLM Visibility Lab — domain types
// The analysis pipeline produces a single AnalysisReport object that every
// report surface renders from. Keeping it serializable lets reports be shared,
// cached, exported, and diffed.
// ─────────────────────────────────────────────────────────────────────────────

export type Grade = "A" | "B" | "C" | "D" | "F";

export type Confidence = "Low" | "Medium" | "High";

export type SignalStatus = "pass" | "warn" | "fail";

/** A single observable signal extracted from the page (the evidence layer). */
export interface Signal {
  id: string;
  label: string;
  status: SignalStatus;
  detail: string;
  /** How much this signal moved the score, for transparency. */
  weight: number;
}

/** Raw, structured facts pulled out of the crawled HTML. */
export interface CrawlResult {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  ok: boolean;
  statusCode: number;
  /** True when we used the deterministic simulator instead of a live fetch. */
  simulated: boolean;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  lang: string | null;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  wordCount: number;
  links: { href: string; text: string; internal: boolean }[];
  images: { src: string; alt: string | null }[];
  jsonLd: JsonLdBlock[];
  hasViewport: boolean;
  hasFavicon: boolean;
  robotsMeta: string | null;
  /** Inferred, not fetched, when simulated. */
  hasSitemapHint: boolean;
  hasRobotsTxtHint: boolean;
}

export interface JsonLdBlock {
  type: string;
  raw: Record<string, unknown>;
}

export type EntityKind =
  | "person"
  | "organization"
  | "product"
  | "topic"
  | "category"
  | "expertise";

export interface Entity {
  id: string;
  name: string;
  kind: EntityKind;
  /** 0–1 — how confidently the page establishes this entity. */
  strength: number;
  /** Where the evidence came from. */
  sources: string[];
}

export interface EntityGraph {
  entities: Entity[];
  edges: { from: string; to: string; relation: string }[];
  /** Quick-glance checklist of the canonical entity classes. */
  coverage: {
    founder: boolean;
    company: boolean;
    product: boolean;
    expertise: boolean;
    category: boolean;
    topics: boolean;
  };
}

export interface PromptResult {
  prompt: string;
  /** 0–100 — confidence this site surfaces for that prompt. */
  visibility: number;
  confidence: Confidence;
  reasoning: string;
  /** What an AI would likely "say" about the site for this prompt. */
  simulatedAnswer: string;
}

export type Priority = "P0" | "P1" | "P2";
export type Impact = "High" | "Medium" | "Low";
export type Difficulty = "Easy" | "Moderate" | "Hard";

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  priority: Priority;
  impact: Impact;
  difficulty: Difficulty;
  category: "structure" | "entities" | "content" | "authority" | "technical";
}

export interface ScoreBlock {
  score: number; // 0–100
  grade: Grade;
  summary: string;
  signals: Signal[];
}

export interface AnalysisReport {
  id: string;
  url: string;
  domain: string;
  createdAt: string;
  simulated: boolean;
  /** Headline composite score. */
  overall: number;
  grade: Grade;
  archetype: string;
  crawl: CrawlResult;

  discoverability: ScoreBlock;
  entityStrength: ScoreBlock & { graph: EntityGraph };
  citation: {
    score: number;
    level: Confidence;
    summary: string;
    factors: Signal[];
  };
  promptVisibility: {
    score: number;
    summary: string;
    results: PromptResult[];
  };
  recommendations: Recommendation[];
  aiSummary: {
    readsLike: string;
    narrative: string;
    strengths: string[];
    risks: string[];
  };
}

/** Lightweight record persisted to history / used in comparisons. */
export interface HistoryEntry {
  id: string;
  url: string;
  domain: string;
  createdAt: string;
  overall: number;
  grade: Grade;
  archetype: string;
}
