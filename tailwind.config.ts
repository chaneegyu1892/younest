import type { Config } from "tailwindcss";
import tokens from "./design/design-tokens.json";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* shadcn CSS 변수 기반 색 (디자인 토큰 HSL 매핑) */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* younest 전용 별칭 (CSS 변수 미사용, 직접 HEX 참조) */
        "primary-hover": tokens.colors.primaryHover,
        private: tokens.colors.private,
        surface: tokens.colors.surface,
        sidebar: tokens.colors.sidebar,
        "text-primary": tokens.colors.text.primary,
        "text-secondary": tokens.colors.text.secondary,
        "text-tertiary": tokens.colors.text.tertiary,
        success: tokens.colors.status.success,
        warning: tokens.colors.status.warning,
        error: tokens.colors.status.error,
      },
      spacing: tokens.spacing,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        full: tokens.borderRadius.full,
      },
      fontFamily: {
        sans: tokens.typography.fontFamily.split(",").map((s) => s.trim()),
      },
      fontSize: tokens.typography.sizes,
      fontWeight: tokens.typography.weights,
      boxShadow: tokens.shadows,
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
