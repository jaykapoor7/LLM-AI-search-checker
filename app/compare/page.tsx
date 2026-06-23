"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Swords } from "lucide-react";
import { runAnalysis } from "@/app/actions/analyze";
import type { AnalysisReport } from "@/lib/types";
import { Panel, Badge, MeterBar } from "@/components/ui/primitives";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { isValidUrlish, scoreTone, cn } from "@/lib/utils";
import { saveReport } from "@/lib/storage";

const TONE = { green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" };

const DIMENSIONS: { key: string; label: string; get: (r: AnalysisReport) => number }[] = [
  { key: "overall", label: "Overall", get: (r) => r.overall },
  { key: "disc", label: "Discoverability", get: (r) => r.discoverability.score },
  { key: "entity", label: "Entity Strength", get: (r) => r.entityStrength.score },
  { key: "cite", label: "Citation", get: (r) => r.citation.score },
  { key: "prompt", label: "Prompt Visibility", get: (r) => r.promptVisibility.score },
];

function CompareInner() {
  const search = useSearchParams();
  const [a, setA] = useState(search.get("a") ?? "");
  const [b, setB] = useState(search.get("b") ?? "");
  const [reportA, setReportA] = useState<AnalysisReport | null>(null);
  const [reportB, setReportB] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!isValidUrlish(a) || !isValidUrlish(b)) {
      setError("Enter two valid URLs to compare.");
      return;
    }
    setError(null);
    setLoading(true);
    setReportA(null);
    setReportB(null);
    const [ra, rb] = await Promise.all([runAnalysis(a), runAnalysis(b)]);
    if (ra.report) {
      saveReport(ra.report);
      setReportA(ra.report);
    }
    if (rb.report) {
      saveReport(rb.report);
      setReportB(rb.report);
    }
    if (!ra.ok || !rb.ok) setError("One of the sites couldn't be analyzed.");
    setLoading(false);
  }

  useEffect(() => {
    if (search.get("a") && search.get("b")) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <span className="mono-label">{"// head-to-head"}</span>
      <h1 className="mt-2 flex items-center gap-3 text-4xl font-semibold tracking-tight text-zinc-50">
        Compare <Swords className="h-7 w-7 text-phosphor" strokeWidth={1.5} />
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Put two sites head-to-head across every AI-visibility dimension. Useful for benchmarking
        against a competitor or a site you admire.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <CompareField value={a} onChange={setA} placeholder="your-site.com" accent="phosphor" />
        <span className="hidden text-center font-mono text-2xs text-muted sm:block">vs</span>
        <CompareField value={b} onChange={setB} placeholder="competitor.com" accent="violet" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-phosphor px-4 py-2.5 font-mono text-sm font-semibold text-ink-950 transition hover:bg-phosphor-dim disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Compare <ArrowRight className="h-4 w-4" /></>}
        </button>
        {error && <span className="font-mono text-2xs text-signal-red">! {error}</span>}
      </div>

      {(reportA || reportB || loading) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="skeleton h-64" />
              <div className="skeleton h-64" />
            </div>
          ) : reportA && reportB ? (
            <ComparisonView a={reportA} b={reportB} />
          ) : null}
        </motion.div>
      )}
    </div>
  );
}

function CompareField({
  value,
  onChange,
  placeholder,
  accent,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  accent: "phosphor" | "violet";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-ink-900/80 p-2 transition focus-within:shadow-glow-sm",
        accent === "phosphor" ? "border-phosphor/30 focus-within:border-phosphor/60" : "border-signal-violet/30 focus-within:border-signal-violet/60"
      )}
    >
      <span className={cn("pl-2 font-mono text-sm", accent === "phosphor" ? "text-phosphor/70" : "text-signal-violet/70")}>
        {">"}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-1 font-mono text-sm text-zinc-100 placeholder:text-muted-dim focus:outline-none"
      />
    </div>
  );
}

function ComparisonView({ a, b }: { a: AnalysisReport; b: AnalysisReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[a, b].map((r, i) => (
          <Panel key={i} className="flex flex-col items-center p-6">
            <Badge tone={i === 0 ? "phosphor" : "violet"}>{r.domain}</Badge>
            <div className="mt-4">
              <RadialGauge value={r.overall} size={160} label={r.grade} />
            </div>
            <p className="mt-2 text-center font-mono text-2xs text-muted">{r.archetype}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-6">
        <span className="mono-label">dimension breakdown</span>
        <div className="mt-4 space-y-4">
          {DIMENSIONS.map((d) => {
            const va = d.get(a);
            const vb = d.get(b);
            const winner = va === vb ? "tie" : va > vb ? "a" : "b";
            return (
              <div key={d.key} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex items-center justify-end gap-3">
                  <div className="w-full max-w-[180px]">
                    <MeterBar value={va} tone={scoreTone(va)} />
                  </div>
                  <span className={cn("w-7 text-right font-mono text-sm tabular-nums", winner === "a" ? "text-phosphor" : "text-muted")}>
                    {va}
                  </span>
                </div>
                <span className="w-28 text-center text-2xs text-zinc-400">{d.label}</span>
                <div className="flex items-center gap-3">
                  <span className={cn("w-7 font-mono text-sm tabular-nums", winner === "b" ? "text-signal-violet" : "text-muted")}>
                    {vb}
                  </span>
                  <div className="w-full max-w-[180px]">
                    <MeterBar value={vb} tone={scoreTone(vb)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-center gap-4 border-t border-ink-700/60 pt-4">
          <Link href={`/report/${a.id}`} className="font-mono text-2xs text-phosphor hover:underline">
            view {a.domain} report →
          </Link>
          <Link href={`/report/${b.id}`} className="font-mono text-2xs text-signal-violet hover:underline">
            view {b.domain} report →
          </Link>
        </div>
      </Panel>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="px-5 py-24 text-center font-mono text-2xs text-muted">loading…</div>}>
      <CompareInner />
    </Suspense>
  );
}
