import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── New Dark Theme Palette ──────────────────────────────────
        background: "#000000",      // Pure black — deep page background
        surface: "#121212",         // Primary surface — Bento Grid / cards
        "border-color": "#64748B",  // Neutral — subtle dividers & borders
        muted: "#94A3B8",           // Light neutral — secondary / label text
        accent: {
          active:  "#008542",       // Secondary green — live meters / active rides
          pending: "#D97706",       // Tertiary amber — alerts / pending statuses
        },

        // ── Legacy aliases kept so any remaining token refs resolve ──
        // (will be overridden in components but kept for safety)
        navy: {
          dark:   "#000000",
          medium: "#121212",
          light:  "#1E1E1E",
          slate:  "#94A3B8",
        },
        crisp: {
          white:     "#FFFFFF",
          offwhite:  "#121212",
          lightgray: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
