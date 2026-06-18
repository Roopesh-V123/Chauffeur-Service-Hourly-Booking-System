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
        navy: {
          dark: "#0B132B",      // Deepest Navy
          medium: "#1C2541",    // Classic Navy Blue
          light: "#3A506B",     // Soft Navy/Steel Blue
          slate: "#5C6B73",     // Cool Slate
        },
        crisp: {
          white: "#FFFFFF",     // Pure Crisp White
          offwhite: "#F8FAFC",  // Soft Slate-White background
          lightgray: "#E2E8F0", // Cool Gray borders
        },
        accent: {
          cyan: "#48CAE4",      // High contrast ice blue/cyan
          blue: "#0077B6",      // Active state blue (Antigravity feel)
          gold: "#D4AF37",      // Premium/luxury gold accent for booking tiers
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
