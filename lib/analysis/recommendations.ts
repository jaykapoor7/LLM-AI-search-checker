import type {
  CrawlResult,
  EntityGraph,
  Recommendation,
  ScoreBlock,
} from "../types";

// Recommendations are derived from actual gaps, not a static list. Each carries
// Priority / Impact / Difficulty so a user can sequence the work. We sort by a
// blended value score (impact ÷ difficulty, weighted by priority).

const IMPACT_W = { High: 3, Medium: 2, Low: 1 };
const DIFF_W = { Easy: 1, Moderate: 2, Hard: 3 };
const PRIO_W = { P0: 3, P1: 2, P2: 1 };

export function buildRecommendations(
  c: CrawlResult,
  graph: EntityGraph,
  discoverability: ScoreBlock,
  entityStrength: ScoreBlock,
  citationScore: number
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (c.jsonLd.length === 0) {
    recs.push({
      id: "add-schema",
      title: "Add schema.org structured data",
      rationale:
        "You have zero JSON-LD. Adding Organization, Person, and Product/Article schema is the single highest-leverage change — it gives AI machine-readable facts to cite instead of guessing.",
      priority: "P0",
      impact: "High",
      difficulty: "Easy",
      category: "structure",
    });
  }

  if (!graph.coverage.category) {
    recs.push({
      id: "declare-category",
      title: "Declare your category explicitly",
      rationale:
        "Nothing on the page states what category you belong to. Add a one-line positioning statement ('X is a ___ for ___') so models can place you in 'best of' answers.",
      priority: "P0",
      impact: "High",
      difficulty: "Easy",
      category: "content",
    });
  }

  if (!c.paragraphs.some((p) => /\b(vs|versus|alternative|compare|compared to)\b/i.test(p))) {
    recs.push({
      id: "comparison-pages",
      title: "Publish comparison & alternatives pages",
      rationale:
        "Comparison content ('X vs Y', 'alternatives to Z') is what surfaces sites for high-intent discovery prompts. You currently have none, so you never enter the consideration set.",
      priority: "P1",
      impact: "High",
      difficulty: "Moderate",
      category: "content",
    });
  }

  if (!graph.coverage.expertise || entityStrength.score < 65) {
    recs.push({
      id: "strengthen-entities",
      title: "Strengthen entity grounding",
      rationale:
        "Your people/company/expertise entities are thin. Add an About page with bios, roles, and a knowsAbout schema so AI can attribute claims to a real, named source.",
      priority: "P1",
      impact: "High",
      difficulty: "Moderate",
      category: "entities",
    });
  }

  if (c.wordCount < 500) {
    recs.push({
      id: "topical-depth",
      title: "Increase topical depth",
      rationale: `Only ${c.wordCount} words of crawlable content. Models cite substance — expand core pages to 600+ words of specific, non-generic copy that answers real questions.`,
      priority: "P1",
      impact: "Medium",
      difficulty: "Moderate",
      category: "content",
    });
  }

  if (!c.metaDescription || (c.metaDescription?.length ?? 0) < 50) {
    recs.push({
      id: "meta-description",
      title: "Write a substantive meta description",
      rationale:
        "Your meta description is missing or too short. It's the summary models lift first — write 140–160 chars that state who you are, what you do, and for whom.",
      priority: "P2",
      impact: "Medium",
      difficulty: "Easy",
      category: "technical",
    });
  }

  const genericCount = c.paragraphs.filter((p) =>
    /\b(world-class|cutting-edge|seamless|next-generation|revolutionize|empower|unlock your)\b/i.test(p)
  ).length;
  if (genericCount >= 1) {
    recs.push({
      id: "reduce-generic",
      title: "Replace generic marketing copy",
      rationale: `${genericCount} passage(s) use filler language ("seamless", "cutting-edge"). Generic copy carries no retrievable information — replace with concrete facts, numbers, and specifics.`,
      priority: "P2",
      impact: "Medium",
      difficulty: "Easy",
      category: "content",
    });
  }

  const external = c.links.filter((l) => !l.internal).length;
  if (external < 3) {
    recs.push({
      id: "outbound-links",
      title: "Cite credible outbound sources",
      rationale:
        "You link out rarely. Referencing authoritative sources situates you in a citation network and signals trustworthiness to retrieval systems.",
      priority: "P2",
      impact: "Low",
      difficulty: "Easy",
      category: "authority",
    });
  }

  if (citationScore < 50) {
    recs.push({
      id: "quotable-facts",
      title: "Add quotable, fact-dense passages",
      rationale:
        "Models cite self-contained sentences that state a verifiable fact. Add a few crisp, standalone claims (with dates and numbers) that an AI can lift verbatim.",
      priority: "P1",
      impact: "Medium",
      difficulty: "Easy",
      category: "authority",
    });
  }

  return recs.sort((a, b) => value(b) - value(a)).slice(0, 8);
}

function value(r: Recommendation): number {
  return (IMPACT_W[r.impact] / DIFF_W[r.difficulty]) * PRIO_W[r.priority];
}
