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
        // apDAO Brand Colors
        background: "#102C37",        // Dark background (darker Nocturnal Expedition)
        card: "#1a3a42",              // Card background
        border: "#2a4a52",            // Border color
        "text-primary": "#e0e0e0",    // Light text for contrast
        "text-secondary": "#a0b0b5",  // Secondary text
        // Chart colors
        stables: "#004D5C",           // Nocturnal Expedition (dark blue)
        volatile: "#EE511E",          // Deep Saffron (orange)
        validator: "#00C5E0",         // Oceanic Bright (cyan)
        lps: "#FFC500",               // Forsythia (yellow)
        // Accent colors
        accent: "#EE511E",            // Deep Saffron (primary accent)
        "accent-blue": "#00C5E0",     // Oceanic Bright
        "accent-yellow": "#FFC500",   // Forsythia
        mint: "#D5E9E3",              // Mystic Mint
        // Status colors
        success: "#00C5E0",           // Oceanic Bright for success
        warning: "#FFC500",           // Forsythia for warning
        error: "#ef4444",             // Keep red for errors
      },
    },
  },
  plugins: [],
};
export default config;
