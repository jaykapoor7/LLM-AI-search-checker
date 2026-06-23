"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn, scoreTone, toGrade } from "@/lib/utils";

const TONE_COLOR = {
  green: "#4ade80",
  amber: "#fbbf24",
  red: "#f87171",
};

export function RadialGauge({
  value,
  size = 220,
  label = "Overall",
  showGrade = true,
}: {
  value: number;
  size?: number;
  label?: string;
  showGrade?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  const stroke = size * 0.055;
  const r = (size - stroke * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = 0.75; // 270° gauge
  const tone = scoreTone(value);
  const color = TONE_COLOR[tone];

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) requestAnimationFrame(step);
      else setDisplay(value);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  const progress = (display / 100) * arc;

  return (
    <div ref={ref} className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.92} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#1b212b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * arc} ${circumference}`}
          transform={`rotate(135 ${cx} ${cx})`}
        />
        {/* tick marks */}
        {Array.from({ length: 28 }).map((_, i) => {
          const angle = 135 + (i / 27) * 270;
          const rad = (angle * Math.PI) / 180;
          const inner = r - stroke;
          const outer = r - stroke + 4;
          return (
            <line
              key={i}
              x1={cx + Math.cos(rad) * inner}
              y1={cx + Math.sin(rad) * inner}
              x2={cx + Math.cos(rad) * outer}
              y2={cx + Math.sin(rad) * outer}
              stroke="#262e3b"
              strokeWidth={1}
            />
          );
        })}
        {/* progress */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          transform={`rotate(135 ${cx} ${cx})`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: size * 0.08 }}>
        <div className="flex items-start font-mono font-semibold tabular-nums" style={{ color }}>
          <span style={{ fontSize: size * 0.26, lineHeight: 1 }}>{Math.round(display)}</span>
          <span className="mt-1 text-muted" style={{ fontSize: size * 0.08 }}>
            /100
          </span>
        </div>
        {showGrade && (
          <div className="mt-1 flex items-center gap-2">
            <span className="mono-label">{label}</span>
            <span
              className={cn("rounded px-1.5 font-mono text-2xs font-bold")}
              style={{ color, backgroundColor: `${color}1a` }}
            >
              {toGrade(value)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
