import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        foreground: "#FAFAFA",
        pub: {
          dark: "#09090B",
          card: "#141417",
          surface: "#1C1C21",
          border: "#27272A",
          gold: "#F59E0B",
          yellow: "#FACC15",
          amber: "#D97706",
          lightYellow: "#FEF08A",
          muted: "#A1A1AA"
        }
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        mono: ["monospace"],
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(250, 204, 21, 0.6)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
