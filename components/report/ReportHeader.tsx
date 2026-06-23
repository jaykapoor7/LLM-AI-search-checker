"use client";

import Link from "next/link";
import { useState } from "react";
import { Share2, FileDown, GitCompareArrows, Check, Globe, RefreshCw, FlaskConical } from "lucide-react";
import type { AnalysisReport } from "@/lib/types";
import { RadialGauge } from "@/components/ui/RadialGauge";
import { Badge } from "@/components/ui/primitives";
import { encodeReport } from "@/lib/share";

export function ReportHeader({ report }: { report: AnalysisReport }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/report/${report.id}?d=${encodeReport(report)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy shareable report link:", url);
    }
  }

  return (
    <div className="panel grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="phosphor">
            <Globe className="h-3 w-3" /> {report.domain}
          </Badge>
          {report.simulated ? (
            <Badge tone="amber" className="gap-1">
              <FlaskConical className="h-3 w-3" /> simulated crawl
            </Badge>
          ) : (
            <Badge tone="green">live crawl</Badge>
          )}
          <span className="font-mono text-2xs text-muted-dim">
            {new Date(report.createdAt).toLocaleString()}
          </span>
        </div>

        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          AI Visibility Report
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          How <span className="text-zinc-200">{report.domain}</span> appears to AI systems that
          discover, understand, and recommend websites.{" "}
          <span className="text-zinc-300">Reads like {report.archetype.toLowerCase()}.</span>
        </p>

        <div className="no-print mt-6 flex flex-wrap gap-2">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 font-mono text-2xs uppercase tracking-wider text-zinc-200 transition hover:border-phosphor/40 hover:text-phosphor"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-signal-green" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Share"}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 font-mono text-2xs uppercase tracking-wider text-zinc-200 transition hover:border-phosphor/40 hover:text-phosphor"
          >
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </button>
          <Link
            href={`/compare?a=${encodeURIComponent(report.url)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 font-mono text-2xs uppercase tracking-wider text-zinc-200 transition hover:border-phosphor/40 hover:text-phosphor"
          >
            <GitCompareArrows className="h-3.5 w-3.5" /> Compare
          </Link>
          <Link
            href={`/analyze?url=${encodeURIComponent(report.url)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 font-mono text-2xs uppercase tracking-wider text-zinc-200 transition hover:border-phosphor/40 hover:text-phosphor"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-run
          </Link>
        </div>
      </div>

      <div className="flex justify-center md:pl-6">
        <RadialGauge value={report.overall} size={200} label="Overall visibility" />
      </div>
    </div>
  );
}
