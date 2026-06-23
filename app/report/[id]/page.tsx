"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import type { AnalysisReport } from "@/lib/types";
import { getReport, saveReport } from "@/lib/storage";
import { decodeReport } from "@/lib/share";
import { ReportHeader } from "@/components/report/ReportHeader";
import {
  DiscoverabilitySection,
  EntitySection,
  CitationSection,
  PromptSection,
  RecommendationsSection,
  AiSummarySection,
} from "@/components/report/sections";
import { UrlInput } from "@/components/landing/UrlInput";
import { Panel } from "@/components/ui/primitives";

function ReportInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [report, setReport] = useState<AnalysisReport | null | undefined>(undefined);

  useEffect(() => {
    const shared = search.get("d");
    if (shared) {
      const decoded = decodeReport(shared);
      if (decoded) {
        saveReport(decoded); // cache shared report locally
        setReport(decoded);
        return;
      }
    }
    setReport(getReport(params.id) ?? null);
  }, [params.id, search]);

  if (report === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <div className="space-y-4">
          <div className="skeleton h-48 w-full" />
          <div className="skeleton h-64 w-full" />
          <div className="skeleton h-64 w-full" />
        </div>
      </div>
    );
  }

  if (report === null) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <Panel className="p-8 text-center">
          <FileSearch className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
          <h1 className="mt-4 text-xl font-semibold text-zinc-100">Report not found</h1>
          <p className="mt-2 text-sm text-muted">
            This report isn't stored on this device. Run a fresh analysis to generate it.
          </p>
          <div className="mt-6">
            <UrlInput autoFocus />
          </div>
          <Link href="/" className="mt-4 inline-block font-mono text-2xs text-muted hover:text-phosphor">
            ← back home
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/analyze" className="no-print mb-5 inline-block font-mono text-2xs text-muted hover:text-phosphor">
        ← new analysis
      </Link>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <ReportHeader report={report} />
      </motion.div>

      <div className="mt-6 space-y-6">
        <DiscoverabilitySection report={report} />
        <EntitySection report={report} />
        <CitationSection report={report} />
        <PromptSection report={report} />
        <RecommendationsSection report={report} />
        <AiSummarySection report={report} />
      </div>

      <div className="no-print mt-10 flex items-center justify-between border-t border-ink-700/60 pt-6">
        <span className="font-mono text-2xs text-muted">
          report id <span className="text-zinc-400">{report.id}</span>
        </span>
        <Link href="/compare" className="font-mono text-2xs text-phosphor hover:underline">
          compare against another site →
        </Link>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="px-5 py-24 text-center font-mono text-2xs text-muted">loading report…</div>}>
      <ReportInner />
    </Suspense>
  );
}
