import Link from "next/link";
import {
  Radar,
  Network,
  Quote,
  MessageSquareText,
  ListChecks,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { UrlInput } from "@/components/landing/UrlInput";
import { HeroTerminal } from "@/components/landing/HeroTerminal";
import { Panel, Reveal, Badge } from "@/components/ui/primitives";

const SECTIONS = [
  { icon: Radar, name: "Discoverability", desc: "Can crawlers parse, index, and understand your pages?", tone: "phosphor" as const },
  { icon: Network, name: "Entity Strength", desc: "Does AI know your founder, company, product & category?", tone: "violet" as const },
  { icon: Quote, name: "Citation Probability", desc: "How likely is an AI to reference you by name?", tone: "blue" as const },
  { icon: MessageSquareText, name: "Prompt Visibility", desc: "Do you surface for 'best X' and 'alternatives' prompts?", tone: "green" as const },
  { icon: ListChecks, name: "GEO Recommendations", desc: "Prioritized fixes ranked by impact and difficulty.", tone: "amber" as const },
  { icon: Sparkles, name: "AI Summary", desc: "'Your website reads like…' — the verdict an AI would give.", tone: "phosphor" as const },
];

const STATS = [
  { k: "60%+", v: "of searches now end without a click" },
  { k: "4", v: "AI retrieval prompts simulated" },
  { k: "30+", v: "page-level signals scored" },
  { k: "0", v: "AI black boxes — every score is explained" },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-5">
      {/* HERO */}
      <section className="grid gap-12 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-24">
        <div>
          <Badge tone="phosphor" className="mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-phosphor animate-pulse" />
            Generative Engine Optimization
          </Badge>
          <h1 className="text-balance font-sans text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
            See what <span className="text-phosphor">AI</span> sees.
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-zinc-400">
            You optimize for Google SEO. But can ChatGPT, Claude, and Perplexity{" "}
            <span className="text-zinc-200">discover, understand, cite, and recommend</span> your
            website? Find out in seconds.
          </p>

          <div className="mt-9 max-w-xl">
            <UrlInput autoFocus />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.v}>
                <div className="font-mono text-2xl font-semibold text-zinc-100">{s.k}</div>
                <div className="mt-1 text-2xs leading-snug text-muted">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pl-4">
          <HeroTerminal />
        </div>
      </section>

      {/* WHAT WE MEASURE */}
      <section className="border-t border-ink-700/60 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="mono-label">{"// the report"}</span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
                Six dimensions of AI visibility
              </h2>
            </div>
            <Link
              href="/analyze"
              className="hidden items-center gap-1 font-mono text-2xs uppercase tracking-wider text-phosphor hover:underline sm:flex"
            >
              Run analysis <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <Panel className="group h-full p-5 transition hover:border-phosphor/30">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xs text-muted-dim">0{i + 1}</span>
                  <s.icon className="h-5 w-5 text-muted transition group-hover:text-phosphor" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-base font-semibold text-zinc-100">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-ink-700/60 py-20">
        <Reveal>
          <span className="mono-label">{"// the engine"}</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100">
            Not a fake AI wrapper.
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            We crawl the real page, extract structured signals, build an entity graph, and simulate
            how a retrieval-augmented model would treat your site. Every score shows its work.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-ink-700/70 bg-ink-700/40 md:grid-cols-4">
          {[
            { n: "01", t: "Crawl", d: "Titles, meta, headings, content, links, JSON-LD." },
            { n: "02", t: "Map entities", d: "People, organizations, products, topics, expertise." },
            { n: "03", t: "Simulate retrieval", d: "Run discovery prompts an AI would actually receive." },
            { n: "04", t: "Score & explain", d: "Weighted, transparent scores + prioritized fixes." },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div className="h-full bg-ink-900 p-6">
                <div className="font-mono text-2xs text-phosphor/70">{step.n}</div>
                <div className="mt-4 text-base font-semibold text-zinc-100">{step.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-700/60 py-24">
        <Reveal>
          <Panel grid className="relative overflow-hidden px-8 py-16 text-center">
            <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50">
                What does AI think of your site?
              </h2>
              <p className="mt-4 text-muted">Free. No signup. Results in seconds.</p>
              <div className="mt-8">
                <UrlInput />
              </div>
            </div>
          </Panel>
        </Reveal>
      </section>

      <footer className="no-print border-t border-ink-700/60 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-mono text-2xs text-muted">
            LLM·Visibility·Lab — built for the post-search web.
          </span>
          <div className="flex gap-4 font-mono text-2xs text-muted">
            <Link href="/analyze" className="hover:text-phosphor">Analyze</Link>
            <Link href="/compare" className="hover:text-phosphor">Compare</Link>
            <Link href="/settings" className="hover:text-phosphor">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
