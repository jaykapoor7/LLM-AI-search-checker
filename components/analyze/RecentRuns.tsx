"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { HistoryEntry } from "@/lib/types";
import { getHistory } from "@/lib/storage";
import { relativeTime, scoreTone } from "@/lib/utils";

const TONE = { green: "text-signal-green", amber: "text-signal-amber", red: "text-signal-red" };

export function RecentRuns() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history === null) return null;
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-700 px-5 py-8 text-center">
        <p className="font-mono text-2xs text-muted">no analyses yet — your history will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="mono-label">recent runs</span>
        <Link href="/settings" className="font-mono text-2xs text-muted hover:text-phosphor">
          manage →
        </Link>
      </div>
      <div className="divide-y divide-ink-700/60 overflow-hidden rounded-xl border border-ink-700/70">
        {history.slice(0, 6).map((h) => (
          <Link
            key={h.id}
            href={`/report/${h.id}`}
            className="group flex items-center gap-4 bg-ink-900/40 px-4 py-3 transition hover:bg-ink-850"
          >
            <span className={`font-mono text-lg font-semibold tabular-nums ${TONE[scoreTone(h.overall)]}`}>
              {h.overall}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-zinc-200">{h.domain}</div>
              <div className="truncate font-mono text-2xs text-muted">{h.archetype}</div>
            </div>
            <span className="font-mono text-2xs text-muted-dim">{relativeTime(h.createdAt)}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-dim transition group-hover:text-phosphor" />
          </Link>
        ))}
      </div>
    </div>
  );
}
