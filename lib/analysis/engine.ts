import type { AnalysisReport, CrawlResult } from "../types";
import { getDomain, hashString, normalizeUrl, toGrade } from "../utils";
import { crawl } from "./crawler";
import { simulateCrawl } from "./simulator";
import { buildEntityGraph } from "./entities";
import { scoreDiscoverability, scoreEntities, scoreCitation } from "./scoring";
import { simulatePrompts } from "./prompts";
import { buildRecommendations } from "./recommendations";
import { buildAiSummary } from "./summary";

// Composite weighting across the four scored dimensions.
const WEIGHTS = { discoverability: 0.3, entity: 0.28, citation: 0.24, prompt: 0.18 };

/**
 * The full analysis pipeline. Attempts a live crawl; if that fails (network
 * blocked, timeout, non-HTML), falls back to a deterministic simulation so the
 * product always returns a complete, reproducible report.
 */
export async function analyze(rawUrl: string): Promise<AnalysisReport> {
  const url = normalizeUrl(rawUrl);

  let crawlResult;
  try {
    crawlResult = await crawl(url);
    // A page with effectively no content is treated as a failed crawl.
    if (!crawlResult.title && crawlResult.wordCount < 20) {
      crawlResult = simulateCrawl(url);
    }
  } catch {
    crawlResult = simulateCrawl(url);
  }

  return buildReport(crawlResult);
}

/**
 * Pure, network-free report builder. Runs the full scoring pipeline over an
 * already-fetched (or simulated) crawl. Safe to call from the client — used to
 * generate demo profiles without a round-trip.
 */
export function buildReport(crawlResult: CrawlResult): AnalysisReport {
  const url = crawlResult.url;
  const domain = getDomain(url);
  const graph = buildEntityGraph(crawlResult);
  const discoverability = scoreDiscoverability(crawlResult);
  const entityBlock = scoreEntities(graph, crawlResult);
  const citation = scoreCitation(crawlResult, discoverability.score, entityBlock.score);
  const promptVisibility = simulatePrompts(crawlResult, graph, discoverability.score, entityBlock.score);
  const recommendations = buildRecommendations(crawlResult, graph, discoverability, entityBlock, citation.score);

  const overall = Math.round(
    discoverability.score * WEIGHTS.discoverability +
      entityBlock.score * WEIGHTS.entity +
      citation.score * WEIGHTS.citation +
      promptVisibility.score * WEIGHTS.prompt
  );

  const ai = buildAiSummary({
    crawl: crawlResult,
    graph,
    discoverability: discoverability.score,
    entityScore: entityBlock.score,
    citationScore: citation.score,
  });

  // Deterministic id derived from domain so re-analysis is shareable/stable.
  const id = hashString(domain + ":" + new Date().toISOString().slice(0, 10)).toString(36);

  return {
    id,
    url,
    domain,
    createdAt: new Date().toISOString(),
    simulated: crawlResult.simulated,
    overall,
    grade: toGrade(overall),
    archetype: ai.archetype,
    crawl: crawlResult,
    discoverability,
    entityStrength: { ...entityBlock, graph },
    citation,
    promptVisibility,
    recommendations,
    aiSummary: {
      readsLike: ai.readsLike,
      narrative: ai.narrative,
      strengths: ai.strengths,
      risks: ai.risks,
    },
  };
}
