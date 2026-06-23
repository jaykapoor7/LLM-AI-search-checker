"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { EntityGraph as EntityGraphT, EntityKind } from "@/lib/types";

const KIND_COLOR: Record<EntityKind, string> = {
  person: "#5eead4",
  organization: "#a78bfa",
  product: "#60a5fa",
  topic: "#4ade80",
  category: "#fbbf24",
  expertise: "#f472b6",
};

const KIND_LABEL: Record<EntityKind, string> = {
  person: "Person",
  organization: "Org",
  product: "Product",
  topic: "Topic",
  category: "Category",
  expertise: "Expertise",
};

interface Positioned {
  id: string;
  name: string;
  kind: EntityKind;
  strength: number;
  x: number;
  y: number;
}

export function EntityGraph({ graph }: { graph: EntityGraphT }) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 640;
  const H = 380;

  const nodes = useMemo<Positioned[]>(() => {
    const list = graph.entities.slice(0, 14);
    // Anchors (person/org) toward center; satellites on a ring around them.
    const anchors = list.filter((e) => e.kind === "person" || e.kind === "organization");
    const satellites = list.filter((e) => e.kind !== "person" && e.kind !== "organization");

    const positioned: Positioned[] = [];
    anchors.slice(0, 3).forEach((e, i) => {
      const angle = (i / Math.max(1, Math.min(3, anchors.length))) * Math.PI * 2 - Math.PI / 2;
      positioned.push({
        ...e,
        x: W / 2 + Math.cos(angle) * (anchors.length > 1 ? 70 : 0),
        y: H / 2 + Math.sin(angle) * (anchors.length > 1 ? 50 : 0),
      });
    });
    satellites.forEach((e, i) => {
      const angle = (i / Math.max(1, satellites.length)) * Math.PI * 2;
      const radius = 130 + (i % 2) * 28;
      positioned.push({
        ...e,
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius * 0.78,
      });
    });
    return positioned;
  }, [graph]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 420 }}>
        <defs>
          <radialGradient id="graph-bg" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(94,234,212,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#graph-bg)" />

        {/* edges */}
        {graph.edges.map((e, i) => {
          const a = nodeById.get(e.from);
          const b = nodeById.get(e.to);
          if (!a || !b) return null;
          const active = hover === e.from || hover === e.to;
          return (
            <motion.line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={active ? "#5eead4" : "#262e3b"}
              strokeWidth={active ? 1.4 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: active ? 0.9 : 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.04 }}
            />
          );
        })}

        {/* nodes */}
        {nodes.map((n, i) => {
          const color = KIND_COLOR[n.kind];
          const r = 6 + n.strength * 14;
          const active = hover === n.id;
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 200, damping: 18 }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              {active && <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />}
              <circle cx={n.x} cy={n.y} r={r} fill={color} fillOpacity={active ? 0.95 : 0.22} stroke={color} strokeWidth={1.5} />
              <text
                x={n.x}
                y={n.y - r - 6}
                textAnchor="middle"
                className="font-mono"
                fontSize={10}
                fill={active ? "#fff" : "#7c8597"}
              >
                {n.name.length > 18 ? n.name.slice(0, 17) + "…" : n.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 px-2">
        {(Object.keys(KIND_LABEL) as EntityKind[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 font-mono text-2xs text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_COLOR[k] }} />
            {KIND_LABEL[k]}
          </span>
        ))}
      </div>
    </div>
  );
}
