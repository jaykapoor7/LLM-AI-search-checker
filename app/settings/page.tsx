"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import {
  getHistory,
  clearHistory,
  removeFromHistory,
  getSettings,
  saveSettings,
  type Settings,
} from "@/lib/storage";
import { Panel, PanelHeader } from "@/components/ui/primitives";
import { relativeTime, scoreTone, cn } from "@/lib/utils";

const TONE = { green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setSettings(getSettings());
    setHistory(getHistory());
  }, []);

  function update(patch: Partial<Settings>) {
    setSettings(saveSettings(patch));
  }

  if (!settings) return <div className="px-5 py-24 text-center font-mono text-2xs text-muted">loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <span className="mono-label">{"// settings"}</span>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-50">Settings</h1>
      <p className="mt-3 text-muted">Configure analysis behavior and manage your local report history.</p>

      <div className="mt-8 space-y-6">
        <Panel>
          <PanelHeader label="Analysis" />
          <div className="divide-y divide-ink-700/50">
            <Toggle
              label="Live crawl"
              desc="Fetch and parse the real page. When off (or unreachable), a deterministic simulation is used."
              checked={settings.liveCrawl}
              onChange={(v) => update({ liveCrawl: v })}
            />
            <Toggle
              label="Reduce motion"
              desc="Minimize animations across the interface."
              checked={settings.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader label="Public profile" />
          <div className="p-5">
            <label className="mono-label">handle</label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 p-2">
              <span className="pl-2 font-mono text-sm text-muted">lvl.lab/</span>
              <input
                value={settings.publicHandle}
                onChange={(e) => update({ publicHandle: e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() })}
                placeholder="your-handle"
                className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-100 placeholder:text-muted-dim focus:outline-none"
              />
              {settings.publicHandle && (
                <Link
                  href={`/profile/${settings.publicHandle}`}
                  className="inline-flex items-center gap-1 rounded-md border border-ink-700 px-2.5 py-1 font-mono text-2xs text-phosphor hover:border-phosphor/40"
                >
                  view <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
            <p className="mt-2 text-2xs text-muted">
              Your public profile showcases your best report and AI-visibility grade.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            label="History"
            right={
              history.length > 0 ? (
                <button
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-signal-red/80 hover:text-signal-red"
                >
                  <Trash2 className="h-3.5 w-3.5" /> clear all
                </button>
              ) : null
            }
          />
          {history.length === 0 ? (
            <div className="p-8 text-center font-mono text-2xs text-muted">no saved analyses</div>
          ) : (
            <div className="divide-y divide-ink-700/50">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-4 px-5 py-3">
                  <span className={cn("font-mono text-lg font-semibold tabular-nums", TONE[scoreTone(h.overall)])}>
                    {h.overall}
                  </span>
                  <Link href={`/report/${h.id}`} className="min-w-0 flex-1 group">
                    <div className="truncate text-sm text-zinc-200 group-hover:text-phosphor">{h.domain}</div>
                    <div className="truncate font-mono text-2xs text-muted">{h.archetype}</div>
                  </Link>
                  <span className="font-mono text-2xs text-muted-dim">{relativeTime(h.createdAt)}</span>
                  <button
                    onClick={() => {
                      removeFromHistory(h.id);
                      setHistory(getHistory());
                    }}
                    className="text-muted-dim hover:text-signal-red"
                    aria-label="remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <p className="text-center font-mono text-2xs text-muted-dim">
          All data is stored locally in your browser. Nothing is sent to a server beyond the crawl.
        </p>
      </div>
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 p-5">
      <div>
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        <p className="mt-0.5 text-2xs leading-snug text-muted">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition",
          checked ? "border-phosphor/50 bg-phosphor/20" : "border-ink-600 bg-ink-800"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full transition-all",
            checked ? "left-[22px] bg-phosphor" : "left-0.5 bg-muted"
          )}
        />
      </button>
    </div>
  );
}
