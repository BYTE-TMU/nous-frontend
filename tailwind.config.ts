import type { Config } from "tailwindcss";

// Brand tokens are undecided — see the root README's "Settled decisions" section.
// Extend `theme.colors` here once the brand palette lands.
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
