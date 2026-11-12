import { cn } from "@/lib/utils";

// Sample output shown on the landing page. Every line is in the server HTML
// and is revealed with a staggered CSS animation, so the panel fills in even
// before (or without) hydration and never changes height while it types.
const LINES = [
  { t: "$ lvl analyze kapoorjay.com", c: "text-zinc-300" },
  { t: "→ crawling 1 page · extracting signals", c: "text-muted" },
  { t: "→ entity graph: 6 nodes · 5 edges", c: "text-muted" },
  { t: "→ simulating AI retrieval across 4 prompts", c: "text-muted" },
  { t: "✓ discoverability ......... 82  [B]", c: "text-signal-green" },
  { t: "✓ entity strength ......... 71  [C]", c: "text-signal-green" },
  { t: "~ citation probability ... MEDIUM", c: "text-signal-amber" },
  { t: "✓ reads like: research-heavy founder site", c: "text-phosphor" },
];

const FIRST_LINE_MS = 400;
const LINE_STEP_MS = 380;

// Hidden until its delay elapses, then slides in. With reduced motion the
// line is simply shown.
const reveal = "opacity-0 animate-type-in motion-reduce:animate-none motion-reduce:opacity-100";

export function HeroTerminal() {
  return (
    <div className="panel scanline overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850/60 px-4 py-2.5">
        <span className="terminal-dot bg-signal-red/70" />
        <span className="terminal-dot bg-signal-amber/70" />
        <span className="terminal-dot bg-signal-green/70" />
        <span className="ml-2 font-mono text-2xs text-muted">retrieval-trace</span>
        <span className="ml-auto font-mono text-2xs text-muted-dim">sample output</span>
      </div>
      <div className="space-y-1.5 p-5 font-mono text-xs leading-relaxed sm:text-[13px]">
        {LINES.map((line, i) => (
          <div
            key={line.t}
            className={cn(reveal, line.c)}
            style={{ animationDelay: `${FIRST_LINE_MS + i * LINE_STEP_MS}ms` }}
          >
            {line.t}
          </div>
        ))}
        <div
          className={reveal}
          style={{ animationDelay: `${FIRST_LINE_MS + LINES.length * LINE_STEP_MS}ms` }}
          aria-hidden
        >
          <span className="text-zinc-300">$ </span>
          <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-phosphor motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
