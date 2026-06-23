import { simulateCrawl } from "./analysis/simulator";
import { buildReport } from "./analysis/engine";
import type { AnalysisReport } from "./types";

// A stable, network-free demo report for the public-profile showcase and
// first-run states. Deterministic: same input → same report.
export function demoReport(seedUrl = "kapoorjay.com"): AnalysisReport {
  return buildReport(simulateCrawl(seedUrl));
}
