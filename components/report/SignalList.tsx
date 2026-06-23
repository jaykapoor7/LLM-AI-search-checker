"use client";

import { motion } from "framer-motion";
import type { Signal } from "@/lib/types";
import { StatusDot } from "@/components/ui/primitives";

export function SignalList({ signals }: { signals: Signal[] }) {
  const sorted = [...signals].sort((a, b) => {
    const order = { fail: 0, warn: 1, pass: 2 };
    return order[a.status] - order[b.status] || b.weight - a.weight;
  });

  return (
    <ul className="divide-y divide-ink-700/50">
      {sorted.map((s, i) => (
        <motion.li
          key={s.id}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
          className="group flex items-start gap-3 px-1 py-3"
        >
          <span className="mt-1.5">
            <StatusDot status={s.status} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-zinc-200">{s.label}</span>
              <span className="shrink-0 font-mono text-2xs text-muted-dim">w{s.weight}</span>
            </div>
            <p className="mt-0.5 text-sm leading-snug text-muted">{s.detail}</p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
