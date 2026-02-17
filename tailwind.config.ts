import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WPUNJ official: Orange and Black
        wpu: {
          orange: "#F06122",
          "orange-hover": "#d9541a",
          "orange-light": "#fef3ee",
          black: "#21201F",
          "black-light": "#3d3c3b",
          white: "#ffffff",
          gray: "#6b7280",
          "gray-light": "#f5f5f5",
        },
        brand: {
          50: "#fef3ee",
          100: "#fde6dc",
          200: "#faccb8",
          300: "#f7a98a",
          400: "#f3824d",
          500: "#F06122",
          600: "#e24d0f",
          700: "#bc3d0c",
          800: "#973211",
          900: "#7c2d12",
        },
        surface: {
          DEFAULT: "#faf8f6",
          card: "#ffffff",
          muted: "#f5f3f0",
        },
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
