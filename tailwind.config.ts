import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cobalt: {
          DEFAULT: "#0755B5",
          hover: "#054291",
          light: "#E8F0FA",
          subtle: "#D1E2F5",
        },
        parchment: {
          DEFAULT: "#F4F2E8",
          surface: "#FCFBF7",
          card: "#FAF9F4",
          border: "#E2DFD2",
          darker: "#D6D2C3",
        },
        slate: {
          charcoal: "#1A1D20",
          text: "#0F172A",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(7, 85, 181, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        floating: "0 12px 24px -4px rgba(7, 85, 181, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

