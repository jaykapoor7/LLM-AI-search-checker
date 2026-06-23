"use client";

import { motion } from "framer-motion";
import {
  Radar,
  Network,
  Quote,
  MessageSquareText,
  ListChecks,
  Sparkles,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { AnalysisReport, Confidence } from "@/lib/types";
import { Panel, PanelHeader, Badge, MeterBar, Reveal } from "@/components/ui/primitives";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { SignalList } from "@/components/report/SignalList";
import { EntityGraph } from "@/components/report/EntityGraph";
import { cn, scoreTone } from "@/lib/utils";

const TONE_TEXT = { green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" };

function SectionShell({
  icon: Icon,
  index,
  label,
  children,
}: {
  icon: typeof Radar;
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <Panel>
        <PanelHeader
          index={index}
          label={label}
          right={<Icon className="h-4 w-4 text-muted" strokeWidth={1.5} />}
        />
        {children}
      </Panel>
    </Reveal>
  );
}

// ── Section 1 — Discoverability ──────────────────────────────────────────────
export function DiscoverabilitySection({ report }: { report: AnalysisReport }) {
  const d = report.discoverability;
  return (
    <SectionShell icon={Radar} index="01" label="Discoverability">
      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:gap-8">
        <div className="flex flex-col items-center justify-center">
          <RadialGauge value={d.score} label="Crawl score" />
          <p className="mt-2 max-w-[220px] text-center text-sm leading-snug text-muted">{d.summary}</p>
        </div>
        <div className="min-w-0">
          <span className="mono-label">signal breakdown — {d.signals.length} checks</span>
          <div className="mt-1">
            <SignalList signals={d.signals} />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 2 — Entity Strength ──────────────────────────────────────────────
export function EntitySection({ report }: { report: AnalysisReport }) {
  const e = report.entityStrength;
  const cov = e.graph.coverage;
  const items: [string, boolean][] = [
    ["founder", cov.founder],
    ["company", cov.company],
    ["product", cov.product],
    ["category", cov.category],
    ["expertise", cov.expertise],
    ["topics", cov.topics],
  ];
  return (
    <SectionShell icon={Network} index="02" label="Entity Strength">
      <div className="grid gap-6 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="flex items-end gap-3">
            <span className={cn("font-mono text-4xl font-semibold tabular-nums", TONE_TEXT[scoreTone(e.score)])}>
              {e.score}
            </span>
            <span className="mb-1 font-mono text-2xs text-muted">/100 · grade {e.grade}</span>
          </div>
          <p className="mt-2 text-sm leading-snug text-muted">{e.summary}</p>

          <div className="mt-5 rounded-lg border border-ink-700/70 bg-ink-850/40 p-4">
            <span className="mono-label">website knows</span>
            <ul className="mt-3 space-y-2">
              {items.map(([k, present]) => (
                <li key={k} className="flex items-center gap-2.5 text-sm">
                  {present ? (
                    <Check className="h-4 w-4 text-signal-green" />
                  ) : (
                    <X className="h-4 w-4 text-signal-red/70" />
                  )}
                  <span className={present ? "text-zinc-200" : "text-muted line-through decoration-ink-500"}>
                    {k}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0">
          <span className="mono-label">knowledge graph — {e.graph.entities.length} entities</span>
          <div className="mt-2 rounded-lg border border-ink-700/60 bg-ink-950/40">
            <EntityGraph graph={e.graph} />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 3 — Citation Probability ─────────────────────────────────────────
const LEVELS: Confidence[] = ["Low", "Medium", "High"];
export function CitationSection({ report }: { report: AnalysisReport }) {
  const c = report.citation;
  const tone = c.level === "High" ? "green" : c.level === "Medium" ? "amber" : "red";
  return (
    <SectionShell icon={Quote} index="03" label="Citation Probability">
      <div className="grid gap-6 p-6 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="flex gap-1.5">
            {LEVELS.map((lvl) => {
              const active = lvl === c.level;
              const ltone = lvl === "High" ? "green" : lvl === "Medium" ? "amber" : "red";
              return (
                <div
                  key={lvl}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-3 text-center transition",
                    active
                      ? ltone === "green"
                        ? "border-signal-green/50 bg-signal-green/10"
                        : ltone === "amber"
                        ? "border-signal-amber/50 bg-signal-amber/10"
                        : "border-signal-red/50 bg-signal-red/10"
                      : "border-ink-700 opacity-40"
                  )}
                >
                  <span className={cn("font-mono text-2xs uppercase tracking-wider", active && TONE_TEXT[ltone])}>
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <Badge tone={tone}>{c.level} likelihood</Badge>
            <span className="font-mono text-2xs text-muted">score {c.score}/100</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{c.summary}</p>
        </div>
        <div className="min-w-0">
          <span className="mono-label">why · {c.factors.length} factors</span>
          <div className="mt-1">
            <SignalList signals={c.factors} />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 4 — Prompt Visibility ────────────────────────────────────────────
export function PromptSection({ report }: { report: AnalysisReport }) {
  const p = report.promptVisibility;
  return (
    <SectionShell icon={MessageSquareText} index="04" label="Prompt Visibility">
      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted">{p.summary}</p>
          <div className="flex items-center gap-2">
            <span className="mono-label">avg visibility</span>
            <span className={cn("font-mono text-xl font-semibold", TONE_TEXT[scoreTone(p.score)])}>{p.score}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {p.results.map((r, i) => {
            const tone = scoreTone(r.visibility);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-lg border border-ink-700/70 bg-ink-850/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-sm text-zinc-200">“{r.prompt}”</span>
                  <Badge tone={tone === "green" ? "green" : tone === "amber" ? "amber" : "red"}>
                    {r.confidence}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <MeterBar value={r.visibility} tone={tone} />
                  <span className={cn("font-mono text-xs tabular-nums", TONE_TEXT[tone])}>{r.visibility}</span>
                </div>
                <p className="mt-3 text-2xs leading-snug text-muted">{r.reasoning}</p>
                <div className="mt-3 rounded-md border border-ink-700/60 bg-ink-950/60 p-2.5">
                  <span className="mono-label text-phosphor/60">simulated AI answer</span>
                  <p className="mt-1 text-2xs italic leading-snug text-zinc-400">{r.simulatedAnswer}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 5 — GEO Recommendations ──────────────────────────────────────────
const IMPACT_TONE = { High: "green", Medium: "amber", Low: "neutral" } as const;
const DIFF_TONE = { Easy: "green", Moderate: "amber", Hard: "red" } as const;
const PRIO_TONE = { P0: "red", P1: "amber", P2: "blue" } as const;

export function RecommendationsSection({ report }: { report: AnalysisReport }) {
  return (
    <SectionShell icon={ListChecks} index="05" label="GEO Recommendations">
      <div className="p-3 sm:p-5">
        <div className="hidden grid-cols-[auto_1fr_repeat(3,90px)] gap-3 border-b border-ink-700/70 px-3 pb-2 sm:grid">
          <span className="mono-label">#</span>
          <span className="mono-label">action</span>
          <span className="mono-label text-center">priority</span>
          <span className="mono-label text-center">impact</span>
          <span className="mono-label text-center">difficulty</span>
        </div>
        <div className="divide-y divide-ink-700/50">
          {report.recommendations.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-1 gap-2 px-3 py-4 sm:grid-cols-[auto_1fr_repeat(3,90px)] sm:items-center sm:gap-3"
            >
              <span className="font-mono text-2xs text-muted-dim sm:pt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-zinc-100">{r.title}</div>
                <p className="mt-1 text-2xs leading-snug text-muted">{r.rationale}</p>
              </div>
              <div className="flex gap-2 sm:contents">
                <div className="sm:text-center">
                  <Badge tone={PRIO_TONE[r.priority]}>{r.priority}</Badge>
                </div>
                <div className="sm:text-center">
                  <Badge tone={IMPACT_TONE[r.impact]}>{r.impact}</Badge>
                </div>
                <div className="sm:text-center">
                  <Badge tone={DIFF_TONE[r.difficulty]}>{r.difficulty}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

// ── Section 6 — AI Summary ───────────────────────────────────────────────────
export function AiSummarySection({ report }: { report: AnalysisReport }) {
  const s = report.aiSummary;
  return (
    <Reveal>
      <Panel grid className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <PanelHeader index="06" label="AI Summary" right={<Sparkles className="h-4 w-4 text-phosphor" strokeWidth={1.5} />} />
        <div className="relative p-6 sm:p-8">
          <span className="mono-label text-phosphor/70">your website reads like</span>
          <p className="mt-3 text-balance text-2xl font-medium leading-snug text-zinc-50 sm:text-3xl">
            “{s.readsLike}.”
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{s.narrative}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-signal-green/20 bg-signal-green/5 p-4">
              <span className="flex items-center gap-2 mono-label text-signal-green">
                <TrendingUp className="h-3.5 w-3.5" /> strengths
              </span>
              <ul className="mt-3 space-y-2">
                {s.strengths.map((x, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal-green" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-signal-red/20 bg-signal-red/5 p-4">
              <span className="flex items-center gap-2 mono-label text-signal-red">
                <TrendingDown className="h-3.5 w-3.5" /> risks
              </span>
              <ul className="mt-3 space-y-2">
                {s.risks.map((x, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-signal-red/70" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Panel>
    </Reveal>
  );
}
