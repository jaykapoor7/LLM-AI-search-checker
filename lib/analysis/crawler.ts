import { parse, HTMLElement } from "node-html-parser";
import type { CrawlResult, JsonLdBlock } from "../types";
import { getDomain, normalizeUrl } from "../utils";

const UA =
  "Mozilla/5.0 (compatible; LLMVisibilityLab/1.0; +https://llm-visibility-lab.vercel.app)";

/**
 * Fetches a URL and extracts the structured signals the scoring engine needs.
 * Throws on network failure so the engine can fall back to the simulator —
 * this keeps the demo working even when outbound fetch is blocked.
 */
export async function crawl(rawUrl: string): Promise<CrawlResult> {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
    signal: controller.signal,
    cache: "no-store",
  }).finally(() => clearTimeout(timeout));

  const html = await res.text();
  return extract(url, res.url || url, res.status, res.ok, html);
}

function attr(el: HTMLElement | null, name: string): string | null {
  return el?.getAttribute(name) ?? null;
}

export function extract(
  requestedUrl: string,
  finalUrl: string,
  statusCode: number,
  ok: boolean,
  html: string
): CrawlResult {
  const root = parse(html, {
    lowerCaseTagName: true,
    comment: false,
    blockTextElements: { script: true, style: false, noscript: false },
  });

  const domain = getDomain(finalUrl);

  const title = root.querySelector("title")?.text?.trim() || null;

  const metas = root.querySelectorAll("meta");
  const ogTags: Record<string, string> = {};
  const twitterTags: Record<string, string> = {};
  let metaDescription: string | null = null;
  let robotsMeta: string | null = null;

  for (const m of metas) {
    const property = (attr(m, "property") || "").toLowerCase();
    const name = (attr(m, "name") || "").toLowerCase();
    const content = attr(m, "content");
    if (!content) continue;
    if (property.startsWith("og:")) ogTags[property] = content;
    if (name.startsWith("twitter:")) twitterTags[name] = content;
    if (name === "description") metaDescription = content;
    if (name === "robots") robotsMeta = content;
  }

  const canonical = attr(root.querySelector('link[rel="canonical"]'), "href");
  const lang = attr(root.querySelector("html"), "lang");
  const hasViewport = !!root.querySelector('meta[name="viewport"]');
  const hasFavicon =
    !!root.querySelector('link[rel*="icon"]') || !!root.querySelector('link[rel="apple-touch-icon"]');

  const headings = root
    .querySelectorAll("h1,h2,h3,h4")
    .map((h) => ({ level: Number(h.tagName.replace("H", "")) || 1, text: clean(h.text) }))
    .filter((h) => h.text.length > 0)
    .slice(0, 60);

  const paragraphs = root
    .querySelectorAll("p,li")
    .map((p) => clean(p.text))
    .filter((t) => t.length > 30)
    .slice(0, 120);

  const bodyText = [title || "", metaDescription || "", ...headings.map((h) => h.text), ...paragraphs].join(" ");
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  const links = root
    .querySelectorAll("a[href]")
    .map((a) => {
      const href = attr(a, "href") || "";
      let internal = false;
      try {
        internal = new URL(href, finalUrl).hostname.replace(/^www\./, "") === domain;
      } catch {
        internal = href.startsWith("/") || href.startsWith("#");
      }
      return { href, text: clean(a.text).slice(0, 80), internal };
    })
    .filter((l) => l.href && !l.href.startsWith("javascript:"))
    .slice(0, 200);

  const images = root
    .querySelectorAll("img")
    .map((img) => ({ src: attr(img, "src") || "", alt: attr(img, "alt") }))
    .slice(0, 80);

  const jsonLd: JsonLdBlock[] = [];
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(s.text);
      const blocks = Array.isArray(parsed) ? parsed : parsed["@graph"] ?? [parsed];
      for (const b of blocks as Record<string, unknown>[]) {
        const type = String(b["@type"] ?? "Thing");
        jsonLd.push({ type, raw: b });
      }
    } catch {
      /* malformed JSON-LD — ignore */
    }
  }

  return {
    url: requestedUrl,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    ok,
    statusCode,
    simulated: false,
    title,
    metaDescription,
    canonical,
    lang,
    ogTags,
    twitterTags,
    headings,
    paragraphs,
    wordCount,
    links,
    images,
    jsonLd,
    hasViewport,
    hasFavicon,
    robotsMeta,
    hasSitemapHint: html.includes("sitemap"),
    hasRobotsTxtHint: true,
  };
}

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}
