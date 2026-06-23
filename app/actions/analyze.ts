"use server";

import { analyze } from "@/lib/analysis/engine";
import type { AnalysisReport } from "@/lib/types";
import { isValidUrlish, normalizeUrl } from "@/lib/utils";

export interface AnalyzeResponse {
  ok: boolean;
  error?: string;
  report?: AnalysisReport;
}

/**
 * Server Action invoked from the analyzer. Runs the full pipeline server-side
 * (crawl → entities → scoring → prompts → recommendations → summary) and
 * returns a complete, serializable report.
 */
export async function runAnalysis(rawUrl: string): Promise<AnalyzeResponse> {
  if (!rawUrl || !isValidUrlish(rawUrl)) {
    return { ok: false, error: "Enter a valid website URL (e.g. kapoorjay.com)." };
  }

  try {
    const report = await analyze(normalizeUrl(rawUrl));
    return { ok: true, report };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Analysis failed unexpectedly.",
    };
  }
}
