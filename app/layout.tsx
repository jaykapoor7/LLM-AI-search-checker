import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TopBar } from "@/components/shell/TopBar";
import { GrainOverlay } from "@/components/shell/GrainOverlay";

export const metadata: Metadata = {
  title: "LLM Visibility Lab — See what AI sees",
  description:
    "You optimize for Google. But can ChatGPT, Claude, and Perplexity discover, understand, cite, and recommend your website? LLM Visibility Lab analyzes your site and simulates AI retrieval.",
  keywords: ["GEO", "generative engine optimization", "AI SEO", "LLM visibility", "AI citations", "entity SEO"],
  authors: [{ name: "LLM Visibility Lab" }],
  openGraph: {
    title: "LLM Visibility Lab — See what AI sees",
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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-sans:'Inter';--font-mono:'JetBrains Mono';}`}</style>
      </head>
      <body>
        <GrainOverlay />
        <TopBar />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
