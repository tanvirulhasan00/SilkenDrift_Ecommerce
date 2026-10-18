import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        silk: {
          50: "#FAF7F2",
          100: "#F4EFEA",
          200: "#E8DFD5",
          300: "#D8C9B9",
          400: "#C3AC95",
          500: "#AB8F73",
          600: "#947458",
          700: "#7A5D44",
          800: "#644C38",
          900: "#533E2F",
          950: "#241A13",
        },
        gold: {
          50: "#FCFAF2",
          100: "#F7F2DE",
          200: "#EFE2B9",
          300: "#E5CE8F",
          400: "#DCBA64",
          500: "#D4AF37",
          600: "#B89224",
          700: "#92711B",
          800: "#75591B",
          900: "#634B1B",
          950: "#1C1608",
        },
        crimson: {
          50: "#FCF2F4",
          100: "#F7E2E6",
          500: "#9E1B32",
          600: "#861428",
          700: "#6E0F20",
        },
        dark: {
          bg: "#0F0E0D",
          surface: "#181614",
          elevated: "#23201D",
          border: "#332F2A",
          muted: "#9E958C",
        },
      },
      fontFamily: {
        sans: [
          "Hind Siliguri",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["Playfair Display", "Merriweather", "serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
        luxury: "0 10px 30px -5px rgba(212, 175, 55, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
