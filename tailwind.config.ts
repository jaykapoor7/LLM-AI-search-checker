import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Research-terminal palette — near-black canvas with phosphor accents
        ink: {
          950: "#050608",
          900: "#0a0c10",
          850: "#0e1116",
          800: "#13171e",
          700: "#1b212b",
          600: "#262e3b",
          500: "#3a4456",
        },
        phosphor: {
          DEFAULT: "#5eead4",
          dim: "#2dd4bf",
          deep: "#0d9488",
        },
        signal: {
          green: "#4ade80",
          amber: "#fbbf24",
          red: "#f87171",
          blue: "#60a5fa",
          violet: "#a78bfa",
        },
        muted: {
          DEFAULT: "#7c8597",
          dim: "#525b6b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,234,212,0.15), 0 0 40px -10px rgba(94,234,212,0.25)",
        "glow-sm": "0 0 0 1px rgba(94,234,212,0.12), 0 0 20px -8px rgba(94,234,212,0.2)",
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(120% 80% at 50% -10%, rgba(94,234,212,0.10), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        scan: "scan 3s linear infinite",
        blink: "blink 1.1s step-end infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.16,1,0.3,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
