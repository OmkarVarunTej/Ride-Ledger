/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0B0D10",
          panel: "#111419",
          raised: "#161A21",
          border: "#232830",
        },
        ink: {
          DEFAULT: "#F2F4F6",
          muted: "#8B93A1",
          faint: "#5A6270",
        },
        fuel: {
          DEFAULT: "#FF8A3D",
          soft: "#FFB37A",
        },
        ledger: {
          DEFAULT: "#34D2C4",
          soft: "#7FE8DD",
        },
        danger: "#FF5C5C",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 20% 0%, rgba(255,138,61,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(52,210,196,0.08), transparent 40%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
