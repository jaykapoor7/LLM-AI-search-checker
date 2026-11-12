import { ImageResponse } from "next/og";

// Link-preview card (og:image / twitter:image), rendered once at build time.
// Colours match the ink / phosphor tokens in tailwind.config.ts.
export const alt = "LLM Visibility Lab: see what AI sees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK_950 = "#050608";
const INK_700 = "#1b212b";
const PHOSPHOR = "#5eead4";
const ZINC_50 = "#fafafa";
const ZINC_400 = "#a1a1aa";
const MUTED = "#7c8597";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: INK_950,
          backgroundImage: "radial-gradient(120% 80% at 50% -20%, rgba(94,234,212,0.16), rgba(5,6,8,0) 60%)",
          color: ZINC_50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: PHOSPHOR,
              boxShadow: "0 0 24px rgba(94,234,212,0.8)",
            }}
          />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            LLM<span style={{ color: PHOSPHOR }}>·</span>Visibility
            <span style={{ color: MUTED, marginLeft: 6 }}>Lab</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
            See what<span style={{ color: PHOSPHOR, margin: "0 26px" }}>AI</span>sees.
          </div>
          <div style={{ marginTop: 28, maxWidth: 1000, fontSize: 34, lineHeight: 1.35, color: ZINC_400 }}>
            {"Check whether ChatGPT, Claude and Perplexity can discover, understand, cite and recommend your website."}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${INK_700}`,
            paddingTop: 28,
            fontSize: 24,
            color: MUTED,
          }}
        >
          <span>llm-ai-search-checker.vercel.app</span>
          <span style={{ color: PHOSPHOR }}>Free · no signup</span>
        </div>
      </div>
    ),
    size
  );
}
