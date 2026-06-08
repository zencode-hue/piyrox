import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "rgba(255,255,255,0.03)",
        border: "rgba(255,255,255,0.1)",
        accent: "#ffffff",
        "accent-2": "#e4e4e7",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glow-violet": "0 0 30px rgba(255,255,255,0.15)",
        "glow-violet-lg": "0 0 60px rgba(255,255,255,0.25)",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "40px",
      },
      backgroundImage: {
        "glass-shine": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
        "violet-glow": "radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [forms],
};

export default config;
