import type { CrawlResult, EntityGraph } from "../types";

// Synthesizes the "Your website reads like…" narrative. This is rule-based
// pattern matching over the extracted signals — deterministic and explainable,
// not a model call. It classifies the site into a recognizable archetype.

interface SummaryInput {
  crawl: CrawlResult;
  graph: EntityGraph;
  discoverability: number;
  entityScore: number;
  citationScore: number;
}

export function buildAiSummary(input: SummaryInput): {
  readsLike: string;
  narrative: string;
  strengths: string[];
  risks: string[];
  archetype: string;
} {
  const { crawl, graph, discoverability, entityScore, citationScore } = input;
  const cov = graph.coverage;
  const hasPerson = cov.founder;
  const hasCompany = cov.company;
  const hasProduct = cov.product;
  const depth = crawl.wordCount;
  const topics = graph.entities.filter((e) => e.kind === "topic").map((e) => e.name);

  const { archetype, readsLike } = classify({
    hasPerson,
    hasCompany,
    hasProduct,
    depth,
    discoverability,
    entityScore,
    citationScore: input.citationScore,
    topics,
  });

  const strengths: string[] = [];
  const risks: string[] = [];

  if (crawl.jsonLd.length) strengths.push("Machine-readable structured data is present.");
  if (discoverability >= 70) strengths.push("Clean, crawlable semantic structure.");
  if (entityScore >= 65) strengths.push("Clear who/what/where entity grounding.");
  if (depth >= 600) strengths.push("Substantive, quotable content depth.");
  if (topics.length >= 2) strengths.push(`Coherent topical focus around ${topics.slice(0, 2).join(" & ")}.`);
  if (!strengths.length) strengths.push("A clean starting point to build retrievability on.");

  if (!crawl.jsonLd.length) risks.push("No structured data — AI must infer everything from prose.");
  if (!cov.category) risks.push("No declared category — invisible to 'best of' prompts.");
  if (citationScore < 50) risks.push("Low citation probability — unlikely to be referenced by name.");
  if (depth < 400) risks.push("Thin content — little for a model to retrieve or quote.");
  if (!cov.expertise) risks.push("Expertise isn't established — claims aren't attributable.");
  if (!risks.length) risks.push("Mostly polish remaining — strengthen comparison & freshness signals.");

  const narrative = buildNarrative(readsLike, { discoverability, entityScore, citationScore, cov, depth });

  return { readsLike, narrative, strengths: strengths.slice(0, 4), risks: risks.slice(0, 4), archetype };
}

function classify(s: {
  hasPerson: boolean;
  hasCompany: boolean;
  hasProduct: boolean;
  depth: number;
  discoverability: number;
  entityScore: number;
  citationScore: number;
  topics: string[];
}): { archetype: string; readsLike: string } {
  const strong = s.entityScore >= 60 && s.discoverability >= 65;

  // Person-led, well-grounded → founder/portfolio territory.
  if (s.hasPerson && strong)
    return { archetype: "Research-heavy founder site", readsLike: "a research-heavy founder site with real intellectual gravity" };
  if (s.hasPerson && !s.hasProduct && s.entityScore >= 45)
    return { archetype: "Personal portfolio", readsLike: "a strong operator portfolio — clear person, lighter on category" };

  // Product/company-led and well-grounded → credible product site.
  if (s.hasProduct && s.hasCompany && strong)
    return { archetype: "Established product site", readsLike: "a credible product site that AI can confidently place and describe" };
  if (s.hasCompany && s.discoverability >= 75 && s.entityScore >= 55)
    return { archetype: "Polished product site", readsLike: "a polished product site — technically clean, with room to deepen its story" };

  // Topical/editorial.
  if (s.topics.length >= 2 && s.depth >= 500 && s.citationScore >= 50)
    return { archetype: "Content / editorial site", readsLike: "a topically-focused content site with citable depth" };

  // Weak signals → the unflattering buckets.
  if (s.discoverability < 50)
    return { archetype: "Under-optimized page", readsLike: "an early-stage page that AI systems can barely parse yet" };
  if (s.hasProduct && s.entityScore < 45)
    return { archetype: "Generic startup landing page", readsLike: "a generic startup landing page — lots of promise, little for AI to grab onto" };
  return { archetype: "Emerging site", readsLike: "an emerging site with the bones of authority but unfinished signals" };
}

function buildNarrative(
  readsLike: string,
  ctx: { discoverability: number; entityScore: number; citationScore: number; cov: EntityGraph["coverage"]; depth: number }
): string {
  const verdict =
    ctx.citationScore >= 70
      ? "An AI assistant would describe and recommend you with confidence."
      : ctx.citationScore >= 45
      ? "An AI assistant could mention you, but would caveat and often paraphrase generically."
      : "An AI assistant would mostly leave you out of the conversation entirely.";

  const lever = !ctx.cov.category
    ? "Declaring your category is the fastest way to start appearing in discovery answers."
    : ctx.depth < 500
    ? "Adding citable depth is what will move you from 'mentioned' to 'recommended'."
    : "Structured data and comparison content are the remaining unlocks.";

  return `To an AI, your site reads like ${readsLike}. ${verdict} ${lever}`;
}
