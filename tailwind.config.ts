/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        bg: "#0d0e11",
        surface: "#14161b",
        surface2: "#1c1f27",
        border: "rgba(255,255,255,0.07)",
        "border-accent": "rgba(255,255,255,0.14)",
        text: "#e8e9ed",
        "text-muted": "#6b7280",
        "text-dim": "#9ca3af",
        accent: "#e8593c",
        "accent-dim": "rgba(232,89,60,0.12)",
        green: "#1D9E75",
        "green-dim": "rgba(29,158,117,0.12)",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      animation: {
        "slide-in": "slideIn 0.4s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};