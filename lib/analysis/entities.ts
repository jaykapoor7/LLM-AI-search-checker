import type { CrawlResult, Entity, EntityGraph, EntityKind } from "../types";
import { hashString } from "../utils";

// Lightweight, dependency-free entity extraction. We combine three evidence
// channels: (1) schema.org JSON-LD (highest confidence), (2) capitalized
// proper-noun n-grams in headings/copy, (3) topical keyword density. This is
// deliberately explainable rather than a black-box NER model.

const STOPWORDS = new Set([
  "The", "And", "For", "With", "Your", "Our", "You", "We", "Get", "How",
  "Why", "What", "Who", "Best", "Top", "New", "All", "More", "About",
  "Home", "Contact", "Menu", "Sign", "Log", "Learn", "Start", "Read",
  "This", "That", "These", "Those", "From", "Into", "Build", "Make",
]);

const TOPIC_LEXICON: Record<string, string[]> = {
  "AI / ML": ["ai", "machine learning", "llm", "model", "neural", "agent", "inference", "gpt"],
  "Developer Tools": ["api", "sdk", "developer", "open source", "framework", "cli", "deploy", "infrastructure"],
  "SaaS": ["platform", "dashboard", "subscription", "saas", "workflow", "automation", "integration"],
  Design: ["design", "ux", "interface", "brand", "typography", "prototype", "figma"],
  Finance: ["fintech", "payments", "invoice", "banking", "crypto", "wallet", "trading"],
  Marketing: ["seo", "growth", "marketing", "content", "audience", "funnel", "campaign"],
  Health: ["health", "wellness", "medical", "fitness", "patient", "clinical", "care"],
  Education: ["course", "learn", "student", "education", "tutorial", "curriculum", "teach"],
  Commerce: ["shop", "store", "product", "ecommerce", "cart", "checkout", "retail"],
  Writing: ["writing", "blog", "essay", "newsletter", "author", "publish", "story"],
};

function makeId(name: string, kind: string) {
  return `${kind}-${hashString(name.toLowerCase()).toString(36)}`;
}

export function buildEntityGraph(crawl: CrawlResult): EntityGraph {
  const entities = new Map<string, Entity>();
  const corpus = [
    crawl.title ?? "",
    crawl.metaDescription ?? "",
    ...crawl.headings.map((h) => h.text),
    ...crawl.paragraphs,
  ].join(" \n ");
  const lower = corpus.toLowerCase();

  const add = (name: string, kind: EntityKind, strength: number, source: string) => {
    const key = `${kind}:${name.toLowerCase()}`;
    const existing = entities.get(key);
    if (existing) {
      existing.strength = Math.min(1, existing.strength + strength * 0.4);
      if (!existing.sources.includes(source)) existing.sources.push(source);
    } else {
      entities.set(key, {
        id: makeId(name, kind),
        name,
        kind,
        strength: Math.min(1, strength),
        sources: [source],
      });
    }
  };

  // 1) schema.org — strongest signal
  for (const block of crawl.jsonLd) {
    const t = block.type.toLowerCase();
    const name = String(block.raw["name"] ?? "");
    if (!name) continue;
    if (t.includes("person")) add(name, "person", 0.95, "schema:Person");
    else if (t.includes("organization") || t.includes("corporation"))
      add(name, "organization", 0.95, "schema:Organization");
    else if (t.includes("product") || t.includes("softwareapplication"))
      add(name, "product", 0.9, "schema:Product");
    const job = block.raw["jobTitle"] ?? block.raw["knowsAbout"];
    if (job) add(String(Array.isArray(job) ? job[0] : job), "expertise", 0.8, "schema:knowsAbout");
  }

  // 2) brand / org from title and og:site_name
  const siteName = crawl.ogTags["og:site_name"];
  if (siteName) add(siteName, "organization", 0.7, "og:site_name");
  if (crawl.title) {
    const brand = crawl.title.split(/[|–—\-:]/)[0]?.trim();
    if (brand && brand.length > 1 && brand.length < 40)
      add(brand, "organization", 0.45, "title");
  }

  // 3) proper-noun people / products from headings + leading copy
  const properNouns = extractProperNouns(
    [crawl.title ?? "", ...crawl.headings.map((h) => h.text), ...crawl.paragraphs.slice(0, 12)].join(" ")
  );
  for (const { phrase, count } of properNouns) {
    const looksPersonal = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(phrase);
    if (looksPersonal) add(phrase, "person", Math.min(0.75, 0.4 + count * 0.12), "proper-noun");
    else add(phrase, "product", Math.min(0.6, 0.3 + count * 0.1), "proper-noun");
  }

  // 4) topical entities via lexicon density
  const topics: { topic: string; hits: number }[] = [];
  for (const [topic, words] of Object.entries(TOPIC_LEXICON)) {
    const hits = words.reduce((acc, w) => acc + countOccurrences(lower, w), 0);
    if (hits >= 2) topics.push({ topic, hits });
  }
  topics.sort((a, b) => b.hits - a.hits);
  for (const { topic, hits } of topics.slice(0, 4)) {
    add(topic, "topic", Math.min(0.85, 0.45 + hits * 0.06), "lexicon");
  }
  if (topics[0]) add(topics[0].topic, "category", Math.min(0.8, 0.4 + topics[0].hits * 0.06), "lexicon");

  // 5) expertise from "about"/bio language
  if (/\b(years of experience|expert|specialist|led|founder|ceo|engineer|researcher|advisor)\b/i.test(corpus)) {
    const role = (corpus.match(/\b(founder|ceo|cto|engineer|designer|researcher|advisor|operator|investor)\b/i) || [])[0];
    if (role) add(capitalize(role), "expertise", 0.6, "bio-language");
  }

  const list = Array.from(entities.values()).sort((a, b) => b.strength - a.strength).slice(0, 24);

  // Edges: connect people/orgs to topics & products (a small knowledge graph)
  const edges: EntityGraph["edges"] = [];
  const anchors = list.filter((e) => e.kind === "person" || e.kind === "organization");
  const targets = list.filter((e) => e.kind === "topic" || e.kind === "product" || e.kind === "expertise");
  for (const a of anchors.slice(0, 3)) {
    for (const t of targets.slice(0, 5)) {
      edges.push({
        from: a.id,
        to: t.id,
        relation: t.kind === "expertise" ? "specializes_in" : t.kind === "product" ? "builds" : "writes_about",
      });
    }
  }

  const coverage = {
    founder: list.some((e) => e.kind === "person" && e.strength > 0.45),
    company: list.some((e) => e.kind === "organization" && e.strength > 0.45),
    product: list.some((e) => e.kind === "product" && e.strength > 0.4),
    expertise: list.some((e) => e.kind === "expertise"),
    category: list.some((e) => e.kind === "category"),
    topics: list.filter((e) => e.kind === "topic").length >= 2,
  };

  return { entities: list, edges, coverage };
}

function extractProperNouns(text: string): { phrase: string; count: number }[] {
  const matches = text.match(/\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,}){0,2})\b/g) || [];
  const counts = new Map<string, number>();
  for (const m of matches) {
    const first = m.split(" ")[0];
    if (STOPWORDS.has(first)) continue;
    if (m.length < 4) continue;
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([phrase, count]) => ({ phrase, count }))
    .filter((p) => p.count >= 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count++;
    idx += needle.length;
  }
  return count;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
