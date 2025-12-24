import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f0f",
        card: "#1a1a1a",
        border: "#2a2a2a",
        "text-primary": "#e0e0e0",
        "text-secondary": "#a0a0a0",
        stables: "#3b82f6",
        volatile: "#a855f7",
        validator: "#22c55e",
        lps: "#f59e0b",
        accent: "#fbbf24",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
