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
        // Chart colors (brighter for visibility)
        stables: "#0088CC",           // Brighter blue
        volatile: "#FF6B35",          // Brighter orange-red
        validator: "#00E5FF",         // Brighter cyan
        lps: "#FFD700",               // Brighter gold
        // Accent colors
        accent: "#FF6B35",            // Brighter Deep Saffron (primary accent)
        "accent-blue": "#00E5FF",     // Brighter Oceanic
        "accent-yellow": "#FFD700",   // Brighter Forsythia
        mint: "#D5E9E3",              // Mystic Mint
        // Status colors
        success: "#00E5FF",           // Brighter cyan for success
        warning: "#FFD700",           // Brighter gold for warning
        error: "#ef4444",             // Keep red for errors
      },
    },
  },
  plugins: [],
};
export default config;
