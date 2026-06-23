import type { AnalysisReport } from "./types";

// Reports are fully self-contained, so a report can travel inside a URL. We
// base64url-encode the JSON (UTF-8 safe) — no backend, no database, links just
// work. Large but fine for the portfolio scope.

export function encodeReport(report: AnalysisReport): string {
  const json = JSON.stringify(report);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = (typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64"));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeReport(encoded: string): AnalysisReport | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as AnalysisReport;
  } catch {
    return null;
  }
}
