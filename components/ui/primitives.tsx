"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SignalStatus } from "@/lib/types";

export function Panel({
  className,
  children,
  grid,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { grid?: boolean }) {
  return (
    <div className={cn("panel", grid && "panel-grid", className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({
  label,
  index,
  title,
  right,
}: {
  label: string;
  index?: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink-700/70 px-5 py-3">
      <div className="flex items-baseline gap-3">
        {index && <span className="font-mono text-2xs text-phosphor/70">{index}</span>}
        <span className="mono-label">{label}</span>
        {title && <span className="text-sm font-medium text-zinc-200">{title}</span>}
      </div>
      {right}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "green" | "amber" | "red" | "phosphor" | "violet" | "blue";
  children: React.ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-ink-600 text-muted",
    green: "border-signal-green/30 text-signal-green bg-signal-green/5",
    amber: "border-signal-amber/30 text-signal-amber bg-signal-amber/5",
    red: "border-signal-red/30 text-signal-red bg-signal-red/5",
    phosphor: "border-phosphor/30 text-phosphor bg-phosphor/5",
    violet: "border-signal-violet/30 text-signal-violet bg-signal-violet/5",
    blue: "border-signal-blue/30 text-signal-blue bg-signal-blue/5",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-2xs uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: SignalStatus }) {
  const color =
    status === "pass" ? "bg-signal-green" : status === "warn" ? "bg-signal-amber" : "bg-signal-red";
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("absolute inset-0 rounded-full opacity-40", color)} />
      <span className={cn("relative m-auto h-2 w-2 rounded-full", color)} />
    </span>
  );
}

/** Counts up to a target value when it scrolls into view. */
export function AnimatedNumber({
  value,
  duration = 1100,
  className,
  decimals = 0,
}: {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(value * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MeterBar({ value, tone }: { value: number; tone: "green" | "amber" | "red" | "phosphor" }) {
  const colors = {
    green: "bg-signal-green",
    amber: "bg-signal-amber",
    red: "bg-signal-red",
    phosphor: "bg-phosphor",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <motion.div
        className={cn("h-full rounded-full", colors[tone])}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
