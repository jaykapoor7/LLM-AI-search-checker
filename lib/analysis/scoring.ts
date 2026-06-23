import type {
  Confidence,
  CrawlResult,
  EntityGraph,
  ScoreBlock,
  Signal,
} from "../types";
import { clamp, toGrade } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Scoring philosophy
// Each dimension is a weighted sum of observable signals. Every signal carries
// its own weight so the report can *show its work* — no opaque numbers. Weights
// were tuned against how retrieval-augmented LLMs actually select sources:
// structured data, semantic clarity, entity grounding, and topical depth.
// ─────────────────────────────────────────────────────────────────────────────

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function aggregate(signals: Signal[]): number {
  const total = signals.reduce((a, s) => a + Math.abs(s.weight), 0) || 1;
  const earned = signals.reduce((a, s) => {
    const factor = s.status === "pass" ? 1 : s.status === "warn" ? 0.5 : 0;
    return a + Math.abs(s.weight) * factor;
  }, 0);
  return clamp(Math.round((earned / total) * 100));
}

// ── Discoverability ──────────────────────────────────────────────────────────
export function scoreDiscoverability(c: CrawlResult): ScoreBlock {
  const signals: Signal[] = [];

  signals.push({
    id: "title",
    label: "Title tag",
    weight: 14,
    status: c.title ? (c.title.length >= 15 && c.title.length <= 65 ? "pass" : "warn") : "fail",
    detail: c.title
      ? `"${truncate(c.title, 60)}" (${c.title.length} chars)`
      : "No <title> found — AI crawlers lead with this.",
  });

  signals.push({
    id: "meta",
    label: "Meta description",
    weight: 10,
    status: c.metaDescription ? (c.metaDescription.length >= 50 ? "pass" : "warn") : "fail",
    detail: c.metaDescription
      ? `${c.metaDescription.length} chars of summary text.`
      : "Missing — models have no curated summary to lift.",
  });

  const h1 = c.headings.filter((h) => h.level === 1).length;
  signals.push({
    id: "h1",
    label: "H1 structure",
    weight: 10,
    status: h1 === 1 ? "pass" : h1 === 0 ? "fail" : "warn",
    detail: h1 === 1 ? "Exactly one H1 — clean topical anchor." : h1 === 0 ? "No H1 heading." : `${h1} H1s — ambiguous primary topic.`,
  });

  const headingDepth = c.headings.length;
  signals.push({
    id: "headings",
    label: "Heading hierarchy",
    weight: 9,
    status: headingDepth >= 5 ? "pass" : headingDepth >= 2 ? "warn" : "fail",
    detail: `${headingDepth} headings — chunking surface for retrieval.`,
  });

  signals.push({
    id: "jsonld",
    label: "Structured data (JSON-LD)",
    weight: 16,
    status: c.jsonLd.length > 0 ? "pass" : "fail",
    detail: c.jsonLd.length
      ? `${c.jsonLd.length} schema block(s): ${[...new Set(c.jsonLd.map((j) => j.type))].join(", ")}`
      : "No schema.org markup — the single biggest GEO miss.",
  });

  signals.push({
    id: "canonical",
    label: "Canonical URL",
    weight: 6,
    status: c.canonical ? "pass" : "warn",
    detail: c.canonical ? "Canonical declared." : "No canonical — risks duplicate-content dilution.",
  });

  signals.push({
    id: "og",
    label: "Open Graph metadata",
    weight: 8,
    status: Object.keys(c.ogTags).length >= 3 ? "pass" : Object.keys(c.ogTags).length ? "warn" : "fail",
    detail: `${Object.keys(c.ogTags).length} OG tags — shapes link unfurls & social retrieval.`,
  });

  signals.push({
    id: "lang",
    label: "Language declared",
    weight: 4,
    status: c.lang ? "pass" : "warn",
    detail: c.lang ? `lang="${c.lang}"` : "No lang attribute.",
  });

  signals.push({
    id: "robots",
    label: "Indexability",
    weight: 9,
    status: c.robotsMeta && /noindex/i.test(c.robotsMeta) ? "fail" : "pass",
    detail:
      c.robotsMeta && /noindex/i.test(c.robotsMeta)
        ? "robots=noindex — actively blocks discovery!"
        : "Page is indexable by crawlers.",
  });

  signals.push({
    id: "content",
    label: "Crawlable content volume",
    weight: 8,
    status: c.wordCount >= 400 ? "pass" : c.wordCount >= 120 ? "warn" : "fail",
    detail: `${c.wordCount} words of extractable text.`,
  });

  signals.push({
    id: "viewport",
    label: "Technical hygiene",
    weight: 4,
    status: c.hasViewport && c.hasFavicon ? "pass" : "warn",
    detail: `viewport ${c.hasViewport ? "✓" : "✕"} · favicon ${c.hasFavicon ? "✓" : "✕"}`,
  });

  const score = aggregate(signals);
  return {
    score,
    grade: toGrade(score),
    summary: discoverabilitySummary(score, c),
    signals,
  };
}

function discoverabilitySummary(score: number, c: CrawlResult): string {
  if (score >= 80) return "Highly crawlable with clean semantics and structured data. AI agents can parse this site cleanly.";
  if (score >= 60) return c.jsonLd.length ? "Solid foundation, but semantic gaps limit how confidently models can index your pages." : "Readable, but the absence of structured data caps how machines understand your content.";
  return "Discovery is constrained. Missing metadata and structure force models to guess at what this page is about.";
}

// ── Entity Strength ──────────────────────────────────────────────────────────
export function scoreEntities(graph: EntityGraph, c: CrawlResult): ScoreBlock {
  const signals: Signal[] = [];
  const cov = graph.coverage;

  signals.push(covSignal("company", "Company / brand identified", cov.company, 16));
  signals.push(covSignal("founder", "Person / founder identified", cov.founder, 14));
  signals.push(covSignal("product", "Product or offering named", cov.product, 14));
  signals.push(covSignal("category", "Clear category", cov.category, 14));
  signals.push(covSignal("expertise", "Demonstrated expertise", cov.expertise, 12));
  signals.push(covSignal("topics", "Multiple grounded topics", cov.topics, 10));

  const schemaEntities = graph.entities.filter((e) => e.sources.some((s) => s.startsWith("schema"))).length;
  signals.push({
    id: "schema-entities",
    label: "Schema-grounded entities",
    weight: 12,
    status: schemaEntities >= 2 ? "pass" : schemaEntities === 1 ? "warn" : "fail",
    detail: schemaEntities
      ? `${schemaEntities} entities backed by machine-readable schema.`
      : "Entities exist only in prose — no machine-readable grounding.",
  });

  const strong = graph.entities.filter((e) => e.strength >= 0.6).length;
  signals.push({
    id: "entity-confidence",
    label: "High-confidence entities",
    weight: 8,
    status: strong >= 3 ? "pass" : strong >= 1 ? "warn" : "fail",
    detail: `${strong} entities established with strong, repeated evidence.`,
  });

  const score = aggregate(signals);
  return {
    score,
    grade: toGrade(score),
    summary: entitySummary(score, cov),
    signals,
  };
}

function covSignal(id: string, label: string, present: boolean, weight: number): Signal {
  return {
    id: `cov-${id}`,
    label,
    weight,
    status: present ? "pass" : "fail",
    detail: present ? "Detected and grounded." : "Not detected — AI can't attribute this to you.",
  };
}

function entitySummary(score: number, cov: EntityGraph["coverage"]): string {
  const missing = Object.entries(cov).filter(([, v]) => !v).map(([k]) => k);
  if (score >= 80) return "Strong entity graph. AI systems can confidently attribute who you are, what you do, and your domain.";
  if (score >= 55) return `Recognizable, but gaps remain around ${missing.slice(0, 2).join(" & ")}. Models will hedge when asked specifics.`;
  return "Weak entity grounding. To an AI, this site is an anonymous page rather than a known person, company, or product.";
}

// ── Citation Probability ─────────────────────────────────────────────────────
export function scoreCitation(
  c: CrawlResult,
  discoverability: number,
  entityScore: number
): { score: number; level: Confidence; summary: string; factors: Signal[] } {
  const factors: Signal[] = [];

  factors.push({
    id: "authority-depth",
    label: "Content depth",
    weight: 22,
    status: c.wordCount >= 800 ? "pass" : c.wordCount >= 300 ? "warn" : "fail",
    detail: `${c.wordCount} words. Models cite substantive, quotable sources.`,
  });

  const uniqueParas = c.paragraphs.filter((p) => p.length > 80).length;
  factors.push({
    id: "quotability",
    label: "Quotable passages",
    weight: 18,
    status: uniqueParas >= 6 ? "pass" : uniqueParas >= 2 ? "warn" : "fail",
    detail: `${uniqueParas} self-contained passages a model could lift verbatim.`,
  });

  factors.push({
    id: "structured-fact",
    label: "Machine-verifiable facts",
    weight: 20,
    status: c.jsonLd.length >= 1 ? "pass" : "fail",
    detail: c.jsonLd.length ? "Structured facts present — easy to cite with confidence." : "No structured facts to anchor a citation.",
  });

  const externalLinks = c.links.filter((l) => !l.internal).length;
  factors.push({
    id: "outbound",
    label: "Outbound references",
    weight: 10,
    status: externalLinks >= 3 ? "pass" : externalLinks >= 1 ? "warn" : "fail",
    detail: `${externalLinks} outbound links — situates you in a citation network.`,
  });

  factors.push({
    id: "entity-anchor",
    label: "Entity grounding",
    weight: 16,
    status: entityScore >= 70 ? "pass" : entityScore >= 45 ? "warn" : "fail",
    detail: "Strong entities make you safer for an AI to name without hallucinating.",
  });

  factors.push({
    id: "discover-anchor",
    label: "Retrievability",
    weight: 14,
    status: discoverability >= 70 ? "pass" : discoverability >= 50 ? "warn" : "fail",
    detail: "If a model can't retrieve you cleanly, it won't cite you.",
  });

  const score = aggregate(factors);
  const level: Confidence = score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";
  return { score, level, summary: citationSummary(level), factors };
}

function citationSummary(level: Confidence): string {
  if (level === "High") return "An AI assistant could reference this site by name with low hallucination risk — you read as a citable source.";
  if (level === "Medium") return "An AI might mention you when directly relevant, but will often paraphrase generically rather than cite you outright.";
  return "Unlikely to be cited. Models will answer from better-grounded sources and leave you out of the conversation.";
}
