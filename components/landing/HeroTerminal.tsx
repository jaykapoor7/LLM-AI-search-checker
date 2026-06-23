"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LINES = [
  { t: "$ lvl analyze kapoorjay.com", c: "text-zinc-300" },
  { t: "→ crawling 1 page · extracting signals", c: "text-muted" },
  { t: "→ entity graph: 6 nodes · 5 edges", c: "text-muted" },
  { t: "→ simulating AI retrieval across 4 prompts", c: "text-muted" },
  { t: "✓ discoverability ......... 82  [B]", c: "text-signal-green" },
  { t: "✓ entity strength ......... 71  [B]", c: "text-signal-green" },
  { t: "~ citation probability ... MEDIUM", c: "text-signal-amber" },
  { t: "✓ reads like: research-heavy founder site", c: "text-phosphor" },
];

export function HeroTerminal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= LINES.length) return;
    const delay = visible === 0 ? 400 : 320 + Math.random() * 260;
    const id = setTimeout(() => setVisible((v) => v + 1), delay);
    return () => clearTimeout(id);
  }, [visible]);

  return (
    <div className="panel scanline overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850/60 px-4 py-2.5">
        <span className="terminal-dot bg-signal-red/70" />
        <span className="terminal-dot bg-signal-amber/70" />
        <span className="terminal-dot bg-signal-green/70" />
        <span className="ml-2 font-mono text-2xs text-muted">retrieval-trace — bash</span>
        <span className="ml-auto font-mono text-2xs text-muted-dim">v1.0</span>
      </div>
      <div className="space-y-1.5 p-5 font-mono text-[13px] leading-relaxed">
        {LINES.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className={line.c}
          >
            {line.t}
          </motion.div>
        ))}
        {visible < LINES.length && (
          <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-phosphor" />
        )}
      </div>
    </div>
  );
}
