# Architecture

A deep dive into how **LLM Visibility Lab** is built and how it scores a site.

## 1. System overview

```
┌──────────────┐   Server Action    ┌─────────────────────────────────────────────┐
│  Client (UI) │ ─ runAnalysis(url) ▶│  Analysis Engine (server, lib/analysis)     │
│  Next.js RSC │                    │  crawl → entities → score → prompts → recs  │
└──────┬───────┘                    └───────────────────┬─────────────────────────┘
       │  AnalysisReport (serializable JSON)            │
       ▼                                                ▼
 localStorage (history) ◀── saveReport ──  share URL (base64 report)
```

There is **no backend database**. The `AnalysisReport` is a single serializable
object that every surface renders from, so reports can be cached locally, encoded
into a share link, diffed in `/compare`, and exported to PDF — all client-side.

## 2. The analysis pipeline

All pipeline modules live in `lib/analysis/` and are **pure and deterministic**
except the crawler's network call.

| Module | Responsibility | Key idea |
|---|---|---|
| `crawler.ts` | Fetch + parse HTML | `node-html-parser`, 9s timeout, extracts 15+ signal types. Throws on failure → fallback. |
| `simulator.ts` | Deterministic fallback crawl | `mulberry32(hash(domain))` → same URL always yields the same plausible page. Flagged `simulated: true`. |
| `entities.ts` | Entity graph | 3 evidence channels: schema.org (0.9–0.95), proper-noun n-grams (0.3–0.75), topical lexicon (0.45–0.85). |
| `scoring.ts` | Discoverability / Entity / Citation | Each score = `Σ(weight × statusFactor) / Σ(weight)`, where `pass=1, warn=0.5, fail=0`. |
| `prompts.ts` | Prompt visibility | Per-intent scoring against the signals that matter for that prompt shape. |
| `recommendations.ts` | GEO fixes | Derived from gaps; ranked by `(impact ÷ difficulty) × priority`. |
| `summary.ts` | "Reads like…" | Rule-based archetype classifier over the score vector. |
| `engine.ts` | Orchestrator | `analyze()` (network) and `buildReport()` (pure) — composite = weighted blend. |

### Composite weighting (`engine.ts`)

```
overall = 0.30·discoverability + 0.28·entity + 0.24·citation + 0.18·prompt
```

These reflect how retrieval-augmented models actually pick sources: clean
retrievability and entity grounding matter most; raw prompt surfacing is the
downstream effect.

## 3. Scoring philosophy

Every dimension is a **weighted sum of observable signals**, and every `Signal`
carries its own `weight`, `status`, and human-readable `detail`. The report
renders these directly — so the product never asks you to trust an opaque number.

Example (Discoverability signals & weights):

| Signal | Weight | Pass condition |
|---|---:|---|
| Structured data (JSON-LD) | 16 | ≥1 schema block |
| Title tag | 14 | present, 15–65 chars |
| Meta description | 10 | present, ≥50 chars |
| H1 structure | 10 | exactly one H1 |
| Indexability | 9 | not `noindex` |
| Heading hierarchy | 9 | ≥5 headings |
| Open Graph | 8 | ≥3 OG tags |
| Crawlable content | 8 | ≥400 words |
| Canonical / lang / hygiene | 14 | — |

Grades: `A ≥90 · B ≥75 · C ≥60 · D ≥45 · F <45`.

## 4. Entity extraction

Confidence-weighted and **explainable** (no black-box NER):

1. **schema.org JSON-LD** — `Person`, `Organization`, `Product`, `knowsAbout`
   (strongest, 0.9+).
2. **Proper-noun n-grams** — capitalized 1–3 grams in title/headings/lead copy,
   filtered against a stopword list; `Firstname Lastname` → person.
3. **Topical lexicon** — keyword density across 10 domains (AI/ML, SaaS, Design,
   Finance…) → topics + a primary category.

Edges connect anchors (person/org) to satellites (topic/product/expertise) with
relations (`builds`, `writes_about`, `specializes_in`), rendered as an animated
SVG knowledge graph.

## 5. Resilience: live crawl vs. simulation

`analyze()` attempts a real fetch. On **timeout, network restriction, non-HTML, or
empty content**, it falls back to `simulateCrawl()`. The simulator is seeded by a
hash of the domain, so:

- the same URL always produces the same report (stable share links),
- the demo works fully offline / in sandboxed CI,
- showcased example domains (`kapoorjay.com`, `vercel.com`…) are pinned to
  flattering archetypes for the landing-page demo.

The UI always labels which path was taken (`live crawl` vs `simulated crawl`).

## 6. UI system

- **Tokens** (`tailwind.config.ts`): `ink` (near-black canvas scale), `phosphor`
  (teal accent), `signal` (green/amber/red/blue/violet), `2xs` mono labels.
- **Primitives** (`components/ui/`): `Panel`, `PanelHeader`, `Badge`, `StatusDot`,
  `AnimatedNumber`, `MeterBar`, `Reveal`, `RadialGauge`.
- **Motion**: count-up gauges (IntersectionObserver), staggered signal reveals,
  spring-positioned graph nodes, scanline loading overlay. All respect
  `prefers-reduced-motion`.

## 7. Data flow for extras

- **Share** — `lib/share.ts` base64url-encodes the full report into `?d=`; the
  report route decodes and re-caches it. No server needed.
- **Compare** — runs two analyses in parallel, diffs the score vectors.
- **History / Settings** — `lib/storage.ts` persists reports + history + settings
  to `localStorage` (capped at 30 entries).
- **PDF** — print stylesheet in `globals.css` (`@media print`) + `window.print()`.
- **Profile** — surfaces the best-scoring report; falls back to a deterministic
  demo via `lib/demo.ts`.

## 8. Extending it

- **Real LLM scoring** — swap the heuristic in `prompts.ts`/`summary.ts` for a
  model call (Claude/OpenAI) behind the same `AnalysisReport` contract; the UI
  needs no changes.
- **Multi-page crawl** — extend `crawler.ts` to follow internal links and
  aggregate signals across a sitemap.
- **Python analysis service** — the engine boundary (`buildReport(CrawlResult)`)
  is a clean seam to offload heavier NLP to a Python microservice.
