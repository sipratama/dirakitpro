import type { Config } from "tailwindcss";

// Tokens sourced from DESIGN.md sections 2 (Color system) and 3 (Typography).
// Do not hardcode hex values in components — extend this file instead.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-amber": "#F5A623",
        "brand-amber-tint": "#FCE9C7",
        "brand-amber-text": "#7A4B00",
        "brand-ink": "#2B2620",
        "brand-teal": "#2F9E6E",
        "brand-teal-tint": "#E4F5EC",
        "brand-teal-text": "#1F6B4A",
        "brand-cream": "#FDF7EF",
        surface: "#FFFFFF",
        neutral: {
          50: "#FDF7EF",
          100: "#E8DFD0",
          300: "#B3A890",
          600: "#7A6F5E",
          900: "#2B2620",
        },
        "tier-build": "#F5A623",
        "tier-understand-bg": "#E3F2FD",
        "tier-understand-text": "#0D47A1",
        "tier-engineer-bg": "#90CAF9",
        "tier-engineer-text": "#0D3D73",
        "tier-production-bg": "#2196F3",
        "tier-production-text": "#FFFFFF",
        "tier-scale-bg": "#0D47A1",
        "tier-scale-text": "#FFFFFF",
        "success-bg": "#E4F5EC",
        "success-text": "#1F6B4A",
        "danger-bg": "#FBEAE7",
        "danger-text": "#7A241A",
        "danger-fill": "#D6483C",
        "warning-bg": "#FBF0DC",
        "warning-text": "#6B4A15",
        "warning-fill": "#C68A2E",
        "info-bg": "#E3F2FD",
        "info-text": "#0D47A1",
        // DESIGN.md 8 — Homepage header/hero only ("Memphis Digital
        // Workshop"). Not part of the section-2 brand palette; don't reuse
        // outside PublicHeader/HeroSection/HeroVisual.
        "memphis-cream": "#F5EFE2",
        "memphis-ink": "#17140D",
        "memphis-coral": "#FF5B57",
        "memphis-teal": "#12B3A4",
        "memphis-mustard": "#FFC531",
        "memphis-violet": "#6B5BE6",
        "memphis-sky": "#3AA0FF",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)"],
        // DESIGN.md 8.2 — homepage header/hero display + body faces.
        "display-memphis": ["var(--font-bricolage)", "system-ui", "sans-serif"],
        "body-memphis": ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["40px", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        h3: ["19px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg": ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        micro: ["11px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        card: "12px",
        control: "10px",
      },
      boxShadow: {
        // DESIGN.md 8.3 — flat "hard offset" shadow, no blur. Reserve
        // hard-lg for the primary CTA and the hero project-preview mockup.
        "hard-sm": "4px 4px 0 0 #17140D",
        "hard-lg": "7px 7px 0 0 #17140D",
      },
    },
  },
};

export default config;
