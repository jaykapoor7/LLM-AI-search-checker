<div align="center">

# LLM Visibility Lab

### See what AI sees.

You optimize for Google SEO — but can ChatGPT, Claude, and Perplexity actually
**discover, understand, cite, and recommend** your website?

**LLM Visibility Lab** crawls a site, builds an entity graph, and simulates how a
retrieval-augmented model treats it — then returns a transparent, explainable
report on its AI visibility.

`Next.js 14` · `TypeScript` · `Tailwind` · `Framer Motion` · `Server Actions` · `Vercel-ready`

</div>

---

> **This is not a fake AI wrapper.** Every score is computed from real, observable
> page signals (structured data, semantics, entity grounding, topical depth) with
> documented weights. No black box — each number shows its work.

## ✦ Features

| | |
|---|---|
| **Discoverability** | Radial gauge over 11 crawl/semantic signals (title, meta, JSON-LD, headings, indexability…) |
| **Entity Strength** | Detects founder / company / product / category / expertise + a live knowledge-graph visualization |
| **Citation Probability** | `Low / Medium / High` — how likely an AI is to reference you by name, with the factors why |
| **Prompt Visibility** | Simulates 4 real discovery prompts (`What is X?`, `Who should use this?`, `Best alternatives?`, `Would you recommend X?`) with simulated AI answers |
| **GEO Recommendations** | Prioritized fixes ranked by `Priority × Impact ÷ Difficulty` |
| **AI Summary** | "Your website reads like…" — the verdict an AI would give, plus strengths & risks |
| **Extras** | Shareable reports (encoded in URL) · compare two sites head-to-head · local analysis history · export to PDF · public profile |

## ✦ Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm run start   # production
npm run typecheck                # strict TS, no emit
npm run lint
```

> **Node 18.17+** required (Next.js 14).

## ✦ How it works

```
URL ─▶ Crawl ─▶ Entity Graph ─▶ Scoring ─▶ Prompt Simulation ─▶ Recommendations ─▶ AI Summary
        │           │              │              │                    │               │
     real fetch   schema.org    weighted       intent-specific      gap-derived,    archetype
     + parse      + NER-lite    signal sums    visibility model     value-ranked    classifier
```

1. **Crawl** — a Server Action fetches the page and extracts titles, meta, headings,
   content, links, images, and JSON-LD (`lib/analysis/crawler.ts`). If the page is
   unreachable (network-restricted env, timeout), it falls back to a **deterministic
   simulator** so the product always returns a complete, reproducible report —
   clearly flagged as `simulated` in the UI.
2. **Entity graph** — combines schema.org (highest confidence), proper-noun
   extraction, and a topical lexicon to identify people, organizations, products,
   topics, category, and expertise (`lib/analysis/entities.ts`).
3. **Scoring** — each dimension is a **weighted sum of observable signals**; every
   signal carries its own weight so the report is fully explainable
   (`lib/analysis/scoring.ts`).
4. **Prompt simulation** — scores the site against the specific signals that matter
   for each prompt *intent* (`lib/analysis/prompts.ts`).
5. **Recommendations** — derived from actual gaps, ranked by impact/difficulty
   (`lib/analysis/recommendations.ts`).
6. **AI summary** — a rule-based archetype classifier produces the "reads like…"
   verdict (`lib/analysis/summary.ts`).

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown, scoring weights,
and folder map.

## ✦ Tech & design

- **Next.js 14 App Router** + **TypeScript** (strict) + **Server Actions**
- **Tailwind CSS** with a custom *research-terminal* token system (phosphor accents,
  ink scale, mono labels) — dark-mode first
- **Framer Motion** for the cinematic loading, count-up gauges, and graph physics
- **Zero database** — reports are self-contained and travel in the URL / `localStorage`
- Aesthetic: **Bloomberg Terminal × Perplexity × Linear × Arc**

## ✦ Folder structure

```
app/
  page.tsx                 Landing — "See what AI sees."
  analyze/                 Analyzer + intelligent loading sequence
  report/[id]/             Full 6-section report
  compare/                 Two-site head-to-head
  settings/                Analysis config + history management
  profile/[handle]/        Public AI-visibility profile
  actions/analyze.ts       Server Action entry point
components/
  shell/                   TopBar, grain overlay
  ui/                      Panel, RadialGauge, primitives
  landing/                 UrlInput, HeroTerminal
  analyze/                 LoadingSequence, RecentRuns
  report/                  Sections, SignalList, EntityGraph
lib/
  analysis/                crawler · simulator · entities · scoring ·
                           prompts · recommendations · summary · engine
  types.ts  storage.ts  share.ts  utils.ts  demo.ts
```

## ✦ Deploy to Vercel

The repo is Vercel-ready (`vercel.json` included).

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

Or: push to GitHub → **Import Project** on [vercel.com/new](https://vercel.com/new)
→ framework auto-detected as Next.js → **Deploy**. No env vars required.

> **Crawling note:** live crawls run server-side from Vercel's network. If a target
> blocks bots or is unreachable, the engine returns a deterministic simulation
> (flagged in the UI). Toggle live crawl in **Settings**.

## ✦ GitHub setup

```bash
git init
git add .
git commit -m "feat: LLM Visibility Lab"
git branch -M main
git remote add origin git@github.com:<you>/llm-visibility-lab.git
git push -u origin main
```

## ✦ License

MIT — see [`LICENSE`](./LICENSE).

<div align="center"><sub>Built for the post-search web.</sub></div>
