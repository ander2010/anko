/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Linear-inspired accent
        linear: {
          50:  "#ECEEFF",
          100: "#D9DCFF",
          200: "#B3BAFF",
          300: "#8D97FF",
          400: "#6B77DD",
          500: "#5E6AD2",
          600: "#4F5ABF",
          700: "#3F49AD",
          800: "#303899",
          900: "#1E2680",
        },
        // Dark surfaces
        surface: {
          0: "#0F0F11",
          1: "#17171A",
          2: "#1E1E21",
          3: "#242428",
        },
        // Zinc (preserved for compatibility)
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        brand: {
          50:  "#ECEEFF",
          100: "#D9DCFF",
          200: "#B3BAFF",
          300: "#8D97FF",
          400: "#6B77DD",
          500: "#5E6AD2",
          600: "#4F5ABF",
          700: "#3F49AD",
          800: "#303899",
          900: "#1E2680",
          950: "#0E154F",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs:    ["11px", { lineHeight: "16px" }],
        sm:    ["12.5px", { lineHeight: "18px" }],
        base:  ["13px", { lineHeight: "20px" }],
        md:    ["14px", { lineHeight: "22px" }],
        lg:    ["15px", { lineHeight: "24px" }],
        xl:    ["17px", { lineHeight: "26px" }],
        "2xl": ["20px", { lineHeight: "28px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["30px", { lineHeight: "38px" }],
      },
      boxShadow: {
        subtle:  "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
        overlay: "0 8px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
        accent:  "0 0 0 3px rgba(94,106,210,0.25)",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
        "2xl": "12px",
        "3xl": "16px",
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
});
