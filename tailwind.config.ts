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
        ink: "#17231d",
        canvas: "#f5f3ec",
        paper: "#fffdf7",
        forest: {
          50: "#edf7f1",
          100: "#d6eddf",
          200: "#aedbc1",
          500: "#2e7a55",
          600: "#246345",
          700: "#1f503a",
          800: "#1b402f",
          900: "#173528",
          950: "#0c1e17"
        },
        marigold: {
          100: "#fff1c7",
          300: "#f4ce72",
          500: "#d99a22"
        },
        stone: {
          100: "#ebe8df",
          300: "#c7c2b6",
          500: "#817c72",
          700: "#4e4a43"
        }
      },
      borderRadius: {
        card: "1.5rem",
        control: "0.875rem"
      },
      boxShadow: {
        card: "0 24px 70px -36px rgba(12, 30, 23, 0.35)"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
