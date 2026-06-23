"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Share2, Check } from "lucide-react";
import type { AnalysisReport, HistoryEntry } from "@/lib/types";
import { getHistory, getReport } from "@/lib/storage";
import { demoReport } from "@/lib/demo";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { Panel, Badge, MeterBar } from "@/components/ui/primitives";
import { scoreTone, relativeTime, cn } from "@/lib/utils";

const TONE = { green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" };

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [best, setBest] = useState<AnalysisReport | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const h = getHistory();
    setHistory(h);
    if (h.length > 0) {
      const top = [...h].sort((a, b) => b.overall - a.overall)[0];
      setBest(getReport(top.id) ?? demoReport());
    } else {
      setBest(demoReport());
    }
  }, []);

  const isDemo = history !== null && history.length === 0;

  const dims = useMemo(
    () =>
      best
        ? [
            { label: "Discoverability", v: best.discoverability.score },
            { label: "Entity Strength", v: best.entityStrength.score },
            { label: "Citation", v: best.citation.score },
            { label: "Prompt Visibility", v: best.promptVisibility.score },
          ]
        : [],
    [best]
  );

  function share() {
    navigator.clipboard?.writeText(window.location.href).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  if (!best) return <div className="px-5 py-24 text-center font-mono text-2xs text-muted">loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Panel grid className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted">lvl.lab/</span>
                <span className="font-mono text-sm text-phosphor">{handle}</span>
                {isDemo && <Badge tone="amber">demo</Badge>}
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                AI Visibility Profile
              </h1>
              <p className="mt-2 max-w-md text-muted">
                {isDemo
                  ? "This is a sample profile. Run an analysis to publish your own AI-visibility grade."
                  : `Best-performing site: ${best.domain}. Reads like ${best.archetype.toLowerCase()}.`}
              </p>
              <button
                onClick={share}
                className="no-print mt-5 inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 font-mono text-2xs uppercase tracking-wider text-zinc-200 transition hover:border-phosphor/40 hover:text-phosphor"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-signal-green" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Share profile"}
              </button>
            </div>
            <RadialGauge value={best.overall} size={180} label="Best score" />
          </div>
        </Panel>
      </motion.div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Panel className="p-6">
          <span className="mono-label">dimension profile</span>
          <div className="mt-4 space-y-4">
            {dims.map((d) => (
              <div key={d.label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{d.label}</span>
                  <span className={cn("font-mono text-sm tabular-nums", TONE[scoreTone(d.v)])}>{d.v}</span>
                </div>
                <MeterBar value={d.v} tone={scoreTone(d.v)} />
              </div>
            ))}
          </div>
          <Link
            href={`/report/${best.id}`}
            className="mt-6 inline-block font-mono text-2xs text-phosphor hover:underline"
          >
            view full report →
          </Link>
        </Panel>

        <Panel className="p-6">
          <span className="flex items-center gap-2 mono-label">
            <Trophy className="h-3.5 w-3.5 text-signal-amber" /> analyzed sites
          </span>
          {history && history.length > 0 ? (
            <div className="mt-4 space-y-3">
              {history.slice(0, 6).map((h) => (
                <Link key={h.id} href={`/report/${h.id}`} className="group flex items-center gap-3">
                  <span className={cn("font-mono text-base font-semibold tabular-nums", TONE[scoreTone(h.overall)])}>
                    {h.overall}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-zinc-300 group-hover:text-phosphor">
                    {h.domain}
                  </span>
                  <span className="font-mono text-2xs text-muted-dim">{relativeTime(h.createdAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No sites analyzed yet.{" "}
              <Link href="/analyze" className="text-phosphor hover:underline">
                Run your first →
              </Link>
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
