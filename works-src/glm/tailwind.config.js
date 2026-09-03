import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EC",
        "paper-deep": "#EFE9DD",
        ink: "#141310",
        "ink-soft": "#3E3A33",
        "ink-mist": "#8A8378",
        "ink-faint": "#C9C2B4",
        res: "#2AA79B",
        "res-deep": "#1D7A72",
        reswarm: "#C96F4A",
      },
      fontFamily: {
        disp: ['"Familjen Grotesk"', '"Noto Sans TC"', "sans-serif"],
        body: ['"Newsreader"', '"Noto Serif TC"', "serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
    },
  },
  plugins: [],
} satisfies Config;
