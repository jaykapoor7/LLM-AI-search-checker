"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Panel } from "@/components/ui/primitives";

const STAGES = [
  { id: "fetch", label: "Fetching page", detail: "Establishing connection · reading HTML" },
  { id: "parse", label: "Extracting signals", detail: "Titles, meta, headings, links, JSON-LD" },
  { id: "entities", label: "Building entity graph", detail: "People · organizations · products · topics" },
  { id: "retrieval", label: "Simulating AI retrieval", detail: "Running discovery prompts through the model lens" },
  { id: "score", label: "Computing scores", detail: "Weighting 30+ signals · generating verdict" },
];

export function LoadingSequence({ domain, done }: { domain: string; done: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (done) {
      setActive(STAGES.length);
      return;
    }
    // Walk the stages but hold on the last one until the real work resolves.
    if (active >= STAGES.length - 1) return;
    const id = setTimeout(() => setActive((a) => Math.min(a + 1, STAGES.length - 1)), 520 + Math.random() * 360);
    return () => clearTimeout(id);
  }, [active, done]);

  return (
    <div className="mx-auto max-w-xl">
      <Panel grid className="scanline overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850/60 px-4 py-2.5">
          <span className="terminal-dot bg-signal-red/70" />
          <span className="terminal-dot bg-signal-amber/70" />
          <span className="terminal-dot bg-signal-green/70" />
          <span className="ml-2 truncate font-mono text-2xs text-muted">analyzing {domain}</span>
        </div>

        <div className="space-y-1 p-5">
          {STAGES.map((stage, i) => {
            const state = i < active || done ? "done" : i === active ? "active" : "pending";
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: state === "pending" ? 0.35 : 1 }}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5"
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {state === "done" ? (
                    <Check className="h-4 w-4 text-signal-green" />
                  ) : state === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-phosphor" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={state === "pending" ? "text-sm text-muted" : "text-sm text-zinc-200"}>
                      {stage.label}
                    </span>
                    <span className="font-mono text-2xs text-muted-dim">
                      {state === "done" ? "ok" : state === "active" ? "···" : ""}
                    </span>
                  </div>
                  {state === "active" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden font-mono text-2xs text-muted"
                    >
                      {stage.detail}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-ink-700/70 px-5 py-3">
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
            <motion.div
              className="h-full bg-phosphor"
              initial={{ width: "8%" }}
              animate={{ width: done ? "100%" : `${15 + (active / STAGES.length) * 75}%` }}
              transition={{ ease: "easeOut", duration: 0.5 }}
            />
          </div>
        </div>
      </Panel>
    </div>
  );
}
