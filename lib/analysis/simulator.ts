import type { CrawlResult, JsonLdBlock } from "../types";
import { getDomain, hashString, normalizeUrl, seededRandom } from "../utils";

// When a live fetch isn't possible (network-restricted env, demo mode), we
// synthesize a *plausible and deterministic* crawl from the URL. Same URL →
// same result, every time, so shared report links stay stable. This is clearly
// flagged in the UI as a simulation, never passed off as a real crawl.

// Pin the domains we showcase in marketing copy to flattering archetypes.
const SHOWCASE: Record<string, "founder" | "saas" | "personal" | "landing"> = {
  "kapoorjay.com": "founder",
  "vercel.com": "saas",
  "linear.app": "saas",
  "perplexity.ai": "founder",
};

const ARCHETYPES = [
  {
    key: "founder",
    topics: ["AI / ML", "Developer Tools"],
    role: "Founder",
    rich: true,
  },
  {
    key: "saas",
    topics: ["SaaS", "Marketing"],
    role: "Product",
    rich: true,
  },
  {
    key: "personal",
    topics: ["Writing", "Design"],
    role: "Creator",
    rich: false,
  },
  {
    key: "landing",
    topics: ["SaaS"],
    role: "Startup",
    rich: false,
  },
] as const;

export function simulateCrawl(rawUrl: string): CrawlResult {
  const url = normalizeUrl(rawUrl);
  const domain = getDomain(url);
  const seed = hashString(domain);
  const rand = seededRandom(seed);
  // A handful of showcased example domains are pinned to a flattering profile
  // so the landing-page demo always lands well. Everything else is derived.
  const showcase = SHOWCASE[domain];
  const arch = showcase ? ARCHETYPES.find((a) => a.key === showcase)! : ARCHETYPES[seed % ARCHETYPES.length];
  const brand = brandFromDomain(domain);
  const person = arch.role === "Founder" || arch.role === "Creator" ? nameFromSeed(seed) : null;
  const topic = arch.topics[0];

  const tier = showcase ? 0.9 : rand(); // overall quality knob
  const rich = arch.rich && tier > 0.35;

  const title = rich
    ? `${brand} — ${topic} for modern teams`
    : `${brand}`;
  const metaDescription = rich
    ? `${brand} helps ${audienceFor(arch.key)} with ${topic.toLowerCase()}. Built by ${person ?? "a small team"} to make ${lower(topic)} faster and clearer.`
    : tier > 0.5
    ? `Welcome to ${brand}.`
    : null;

  const headings = rich
    ? [
        { level: 1, text: `${brand}: ${topic} that AI can actually understand` },
        { level: 2, text: `What ${brand} does` },
        { level: 2, text: `Who it's for` },
        { level: 2, text: `Why ${topic}` },
        { level: 3, text: `${brand} vs alternatives` },
        { level: 2, text: `About ${person ?? brand}` },
      ]
    : [
        { level: 1, text: brand },
        { level: 2, text: "Coming soon" },
      ];

  const paragraphs = rich
    ? [
        `${brand} is a ${lower(topic)} platform for ${audienceFor(arch.key)}. We focus on clarity and depth rather than generic promises.`,
        `Founded by ${person ?? "an experienced team"}, ${brand} brings years of experience in ${lower(topic)} to a problem that most tools ignore.`,
        `Unlike alternatives, ${brand} is designed to be machine-readable and citable, so both people and AI systems can understand exactly what we do.`,
        `Our customers are ${audienceFor(arch.key)} who care about being discoverable. We publish comparison guides and detailed documentation.`,
        `If you're comparing ${brand} vs other options, the difference is depth: specific, verifiable claims instead of marketing filler.`,
        `Reach out to learn how ${brand} can improve your ${lower(topic)} workflow today.`,
      ]
    : [
        `${brand} is launching soon. Sign up to be notified.`,
        `We're building something seamless and world-class.`,
      ];

  const jsonLd: JsonLdBlock[] = [];
  if (rich) {
    jsonLd.push({
      type: "Organization",
      raw: { "@type": "Organization", name: brand, url, description: metaDescription },
    });
    if (person)
      jsonLd.push({
        type: "Person",
        raw: { "@type": "Person", name: person, jobTitle: arch.role, knowsAbout: topic },
      });
    if (tier > 0.6)
      jsonLd.push({
        type: "WebSite",
        raw: { "@type": "WebSite", name: brand, url },
      });
  }

  const links = [
    { href: "/about", text: "About", internal: true },
    { href: "/blog", text: "Blog", internal: true },
    { href: "/contact", text: "Contact", internal: true },
    ...(rich
      ? [
          { href: "https://news.ycombinator.com", text: "Featured", internal: false },
          { href: "https://github.com", text: "GitHub", internal: false },
          { href: "https://twitter.com", text: "Twitter", internal: false },
        ]
      : []),
  ];

  const wordCount = paragraphs.join(" ").split(/\s+/).filter(Boolean).length + headings.length * 6;

  return {
    url,
    finalUrl: url,
    fetchedAt: new Date().toISOString(),
    ok: true,
    statusCode: 200,
    simulated: true,
    title,
    metaDescription,
    canonical: rich ? url : null,
    lang: "en",
    ogTags: rich
      ? { "og:title": title, "og:description": metaDescription ?? "", "og:site_name": brand, "og:type": "website" }
      : tier > 0.6
      ? { "og:title": title }
      : {},
    twitterTags: rich ? { "twitter:card": "summary_large_image" } : {},
    headings,
    paragraphs,
    wordCount,
    links,
    images: rich ? [{ src: "/og.png", alt: `${brand} logo` }] : [{ src: "/hero.png", alt: null }],
    jsonLd,
    hasViewport: true,
    hasFavicon: rich,
    robotsMeta: null,
    hasSitemapHint: rich,
    hasRobotsTxtHint: true,
  };
}

function brandFromDomain(domain: string): string {
  const base = domain.split(".")[0];
  return base
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const FIRST = ["Jay", "Aria", "Noah", "Maya", "Leo", "Zoe", "Ravi", "Ivy", "Kai", "Nina"];
const LAST = ["Kapoor", "Chen", "Patel", "Rivera", "Okafor", "Müller", "Sato", "Khan", "Silva", "Park"];
function nameFromSeed(seed: number): string {
  return `${FIRST[seed % FIRST.length]} ${LAST[(seed >>> 3) % LAST.length]}`;
}

function audienceFor(key: string): string {
  return (
    {
      founder: "founders and operators",
      saas: "startup teams",
      personal: "creators and writers",
      landing: "early adopters",
    }[key] ?? "modern teams"
  );
}

const lower = (s: string) => s.toLowerCase();
