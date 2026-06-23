"use client";

import type { AnalysisReport, HistoryEntry } from "./types";

// Reports are persisted client-side (localStorage) — no backend required for
// the portfolio build. History powers the recents list, comparisons, and the
// shareable report route (reports are also encoded into the share URL).

const HISTORY_KEY = "lvl:history:v1";
const REPORT_PREFIX = "lvl:report:";

export function saveReport(report: AnalysisReport): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REPORT_PREFIX + report.id, JSON.stringify(report));
    const entry: HistoryEntry = {
      id: report.id,
      url: report.url,
      domain: report.domain,
      createdAt: report.createdAt,
      overall: report.overall,
      grade: report.grade,
      archetype: report.archetype,
    };
    const history = getHistory().filter((h) => h.id !== report.id);
    history.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch {
    /* storage full or unavailable — non-fatal */
  }
}

export function getReport(id: string): AnalysisReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REPORT_PREFIX + id);
    return raw ? (JSON.parse(raw) as AnalysisReport) : null;
  } catch {
    return null;
  }
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  for (const h of getHistory()) localStorage.removeItem(REPORT_PREFIX + h.id);
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REPORT_PREFIX + id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(getHistory().filter((h) => h.id !== id)));
}

// ── Settings ─────────────────────────────────────────────────────────────────
export interface Settings {
  liveCrawl: boolean;
  reduceMotion: boolean;
  publicHandle: string;
}

const SETTINGS_KEY = "lvl:settings:v1";
const DEFAULT_SETTINGS: Settings = { liveCrawl: true, reduceMotion: false, publicHandle: "" };

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...s };
  if (typeof window !== "undefined") localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}
