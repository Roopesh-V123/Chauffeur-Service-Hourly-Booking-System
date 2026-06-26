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
        // ── Dynamic Color Palette (maps to CSS variables) ──
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "border-color": "var(--border)",
        muted: "var(--muted)",
        accent: {
          active:  "var(--accent-active)",
          pending: "var(--accent-pending)",
        },

        // ── Legacy aliases kept for safety ──
        navy: {
          dark:   "var(--background)",
          medium: "var(--surface)",
          light:  "var(--surface-light)",
          slate:  "var(--muted)",
        },
        crisp: {
          white:     "var(--foreground)",
          offwhite:  "var(--surface)",
          lightgray: "var(--border)",
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
