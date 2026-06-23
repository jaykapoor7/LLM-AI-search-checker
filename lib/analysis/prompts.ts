import type {
  Confidence,
  CrawlResult,
  EntityGraph,
  PromptResult,
} from "../types";
import { clamp } from "../utils";

// Simulates how a site would surface across the prompt shapes that actually
// drive AI recommendations. Each prompt is scored against the specific signals
// that matter for *that* intent (e.g. "best X" rewards category clarity +
// comparison content; "who should use this" rewards audience language).

function conf(score: number): Confidence {
  return score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";
}

function hasany(c: CrawlResult, words: string[]): number {
  const text = (
    c.title +
    " " +
    (c.metaDescription ?? "") +
    " " +
    c.headings.map((h) => h.text).join(" ") +
    " " +
    c.paragraphs.join(" ")
  ).toLowerCase();
  return words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
}

export function simulatePrompts(
  c: CrawlResult,
  graph: EntityGraph,
  discoverability: number,
  entityScore: number
): { score: number; summary: string; results: PromptResult[] } {
  const category = graph.entities.find((e) => e.kind === "category")?.name;
  const topic = graph.entities.find((e) => e.kind === "topic")?.name ?? category ?? "this space";
  const brand =
    graph.entities.find((e) => e.kind === "organization")?.name ??
    graph.entities.find((e) => e.kind === "product")?.name ??
    c.title?.split(/[|\-–]/)[0]?.trim() ??
    "This site";
  const person = graph.entities.find((e) => e.kind === "person")?.name;

  const results: PromptResult[] = [];

  // 1) "What is this company / site?"
  {
    let v = 30 + entityScore * 0.4 + discoverability * 0.2;
    if (c.metaDescription) v += 8;
    if (graph.coverage.company || graph.coverage.product) v += 10;
    v = clamp(Math.round(v));
    results.push({
      prompt: `What is ${brand}?`,
      visibility: v,
      confidence: conf(v),
      reasoning:
        v >= 70
          ? "Clear identity signals let a model answer this confidently and correctly."
          : v >= 45
          ? "A model can attempt an answer but will hedge on specifics it can't verify."
          : "Too little grounding — a model would likely say it doesn't have enough information.",
      simulatedAnswer:
        v >= 45
          ? `${brand}${person ? `, by ${person},` : ""} appears to be focused on ${topic.toLowerCase()}. ${c.metaDescription ? `"${truncate(c.metaDescription, 90)}"` : ""}`
          : `I don't have enough reliable information about ${brand} to describe it confidently.`,
    });
  }

  // 2) "Who should use this?"
  {
    const audienceHits = hasany(c, ["founder", "startup", "developer", "team", "creator", "student", "business", "marketer", "designer", "for "]);
    let v = 25 + audienceHits * 9 + entityScore * 0.15;
    v = clamp(Math.round(v));
    results.push({
      prompt: "Who should use this?",
      visibility: v,
      confidence: conf(v),
      reasoning:
        audienceHits >= 2
          ? "Explicit audience language lets a model match you to the right user."
          : "No clear audience framing — the model can't tell who you're for.",
      simulatedAnswer:
        v >= 45
          ? `It seems aimed at ${audienceLabel(c)} working in ${topic.toLowerCase()}.`
          : `It's unclear who the intended audience is from the available content.`,
    });
  }

  // 3) "Best alternatives / best X"
  {
    const comparisonHits = hasany(c, ["vs", "alternative", "compare", "competitor", "instead of", "better than"]);
    let v = 20 + (category ? 18 : 0) + comparisonHits * 12 + discoverability * 0.15;
    v = clamp(Math.round(v));
    results.push({
      prompt: category ? `Best ${category.toLowerCase()} tools?` : `Best tools like ${brand}?`,
      visibility: v,
      confidence: conf(v),
      reasoning:
        v >= 70
          ? "Strong category signals + comparison content put you in the consideration set."
          : v >= 45
          ? "You might appear, but without comparison pages you're easy to overlook."
          : "Almost no chance of surfacing — no category anchor or comparison content.",
      simulatedAnswer:
        v >= 55
          ? `${brand} could be mentioned among options for ${topic.toLowerCase()}, alongside more established names.`
          : `${brand} is unlikely to come up; better-documented alternatives would be named first.`,
    });
  }

  // 4) "Would you recommend this?"
  {
    let v = 15 + entityScore * 0.3 + discoverability * 0.2 + (c.jsonLd.length ? 12 : 0);
    v = clamp(Math.round(v));
    results.push({
      prompt: `Would you recommend ${brand}?`,
      visibility: v,
      confidence: conf(v),
      reasoning:
        v >= 70
          ? "Enough trustworthy signal for a model to make a qualified recommendation."
          : v >= 45
          ? "A model would recommend cautiously, caveating limited information."
          : "A model would decline to recommend something it can barely characterize.",
      simulatedAnswer:
        v >= 55
          ? `Based on available signals, ${brand} looks credible for ${topic.toLowerCase()}, though I'd verify recency.`
          : `I can't responsibly recommend ${brand} — there isn't enough verifiable information.`,
    });
  }

  const score = clamp(Math.round(results.reduce((a, r) => a + r.visibility, 0) / results.length));
  return {
    score,
    summary:
      score >= 70
        ? "You surface confidently across the prompt shapes that drive AI recommendations."
        : score >= 45
        ? "You appear inconsistently — present for direct lookups, invisible for discovery prompts."
        : "You're effectively invisible in AI conversations. Discovery prompts never reach you.",
    results,
  };
}

function audienceLabel(c: CrawlResult): string {
  const map: [string, string][] = [
    ["founder", "founders"],
    ["startup", "startups"],
    ["developer", "developers"],
    ["creator", "creators"],
    ["student", "students"],
    ["designer", "designers"],
    ["marketer", "marketers"],
  ];
  const text = (c.title + " " + (c.metaDescription ?? "") + " " + c.paragraphs.join(" ")).toLowerCase();
  const hits = map.filter(([k]) => text.includes(k)).map(([, v]) => v);
  return hits.length ? hits.slice(0, 2).join(" and ") : "a general professional audience";
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
