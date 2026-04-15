/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Industrial dark surfaces — neutral only, no tint
        surface: {
          0: "#06060a",
          1: "#0c0c14",
          2: "#13131e",
          3: "#1a1a28",
          4: "#222233",
          5: "#2a2a3d",
        },
        border: {
          DEFAULT: "#2a2a3d",
          light: "#363650",
        },
        // Deep-green accent — the ONE accent color
        accent: {
          DEFAULT: "#16a34a",
          hover: "#22c55e",
          muted: "rgba(22, 163, 74, 0.12)",
          dim: "rgba(22, 163, 74, 0.06)",
        },
      },
      fontFamily: {
        // Two font families: editorial sans + industrial mono
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      animation: {
        // Three purposeful motion patterns total
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "live-pulse": "livePulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
    },
  },
  plugins: [],
};
