import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/components/shell/TopBar";
import { GrainOverlay } from "@/components/shell/GrainOverlay";

// Self-hosted at build time by next/font. The CSS variables feed the
// `font-sans` / `font-mono` families in tailwind.config.ts.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  // Makes the generated og:image / twitter:image URLs absolute.
  metadataBase: new URL("https://llm-ai-search-checker.vercel.app"),
  title: "LLM Visibility Lab: see what AI sees",
  description:
    "You optimize for Google. But can ChatGPT, Claude, and Perplexity discover, understand, cite, and recommend your website? LLM Visibility Lab analyzes your site and simulates AI retrieval.",
  keywords: ["GEO", "generative engine optimization", "AI SEO", "LLM visibility", "AI citations", "entity SEO"],
  authors: [{ name: "LLM Visibility Lab" }],
  openGraph: {
    title: "LLM Visibility Lab: see what AI sees",
    description: "Analyze whether AI systems can discover, understand, cite, and recommend your website.",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "LLM Visibility Lab", description: "See what AI sees." },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <GrainOverlay />
        <TopBar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
