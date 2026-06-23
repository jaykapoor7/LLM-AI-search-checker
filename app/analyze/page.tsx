"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { runAnalysis } from "@/app/actions/analyze";
import { UrlInput } from "@/components/landing/UrlInput";
import { LoadingSequence } from "@/components/analyze/LoadingSequence";
import { RecentRuns } from "@/components/analyze/RecentRuns";
import { Panel } from "@/components/ui/primitives";
import { saveReport } from "@/lib/storage";
import { getDomain } from "@/lib/utils";

function AnalyzeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const url = params.get("url");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    if (!url || ranFor.current === url) return;
    ranFor.current = url;
    setDone(false);
    setError(null);

    const startedAt = Date.now();
    runAnalysis(url).then((res) => {
      // Keep the loading animation on screen for a beat so it feels deliberate.
      const elapsed = Date.now() - startedAt;
      const hold = Math.max(0, 2200 - elapsed);
      setTimeout(() => {
        if (!res.ok || !res.report) {
          setError(res.error ?? "Analysis failed.");
          return;
        }
        saveReport(res.report);
        setDone(true);
        setTimeout(() => router.push(`/report/${res.report!.id}`), 650);
      }, hold);
    });
  }, [url, router]);

  if (!url) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <span className="mono-label">{"// analyzer"}</span>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-50">Analyze a website</h1>
        <p className="mt-3 text-muted">
          Enter any URL. We'll crawl it, map its entities, and simulate how AI systems discover,
          understand, and cite it.
        </p>
        <div className="mt-8">
          <UrlInput autoFocus />
        </div>
        <div className="mt-12">
          <RecentRuns />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <Panel className="p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-signal-amber" strokeWidth={1.5} />
          <h2 className="mt-4 text-xl font-semibold text-zinc-100">Couldn't analyze that</h2>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <div className="mt-6">
            <UrlInput autoFocus />
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="px-5 py-24">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8 text-center">
          <span className="mono-label">simulating retrieval</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
            Reading {getDomain(url)} the way an AI would
          </h1>
        </div>
        <LoadingSequence domain={getDomain(url)} done={done} />
      </motion.div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="px-5 py-24 text-center font-mono text-2xs text-muted">loading…</div>}>
      <AnalyzeInner />
    </Suspense>
  );
}
