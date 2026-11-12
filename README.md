# LLM Visibility Lab

Checks whether AI assistants such as ChatGPT, Claude and Perplexity can find, understand, cite and recommend a website. It crawls the page, scores what it finds and shows the reasoning behind every score.

Live: https://llm-ai-search-checker.vercel.app

## What it does

- **Discoverability**: scores 11 crawl and markup signals (title, meta description, headings, JSON-LD, canonical URL, indexability and others).
- **Entity strength**: finds the company, people, product, category and expertise on the page and draws them as a graph.
- **Citation probability**: Low, Medium or High, with the factors behind the rating.
- **Prompt visibility**: simulates four prompts ("What is X?", "Who should use this?", a "best tools" prompt and "Would you recommend X?") and shows a sample answer for each.
- **Recommendations**: up to eight fixes, sorted by impact divided by difficulty and weighted by priority.
- **AI summary**: a rule-based "your site reads like…" verdict with strengths and risks.
- Also: compare two sites, share a report as a link, local history, print to PDF and a public profile page.

There are no LLM calls. Each score is a weighted sum of signals read from the page (`lib/analysis/scoring.ts`). If a page can't be fetched, the app falls back to a deterministic simulation and labels the report "simulated crawl". Live crawling can be switched off in Settings.

## Run locally

Requires Node 18.17 or later. No environment variables are needed.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm run lint`.

## Stack

Next.js 14 (App Router, Server Actions), TypeScript, Tailwind CSS, Framer Motion and node-html-parser, deployed on Vercel. There is no database: reports are kept in `localStorage` and share links carry the report in the URL.

[ARCHITECTURE.md](./ARCHITECTURE.md) covers the pipeline, scoring weights and folder layout.

## License

MIT, see [LICENSE](./LICENSE).
