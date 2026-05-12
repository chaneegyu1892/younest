import type { Config } from "tailwindcss";
import tokens from "./design/design-tokens.json";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        "primary-hover": tokens.colors.primaryHover,
        private: tokens.colors.private,
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        sidebar: tokens.colors.sidebar,
        border: tokens.colors.border,
        "text-primary": tokens.colors.text.primary,
        "text-secondary": tokens.colors.text.secondary,
        "text-tertiary": tokens.colors.text.tertiary,
        success: tokens.colors.status.success,
        warning: tokens.colors.status.warning,
        error: tokens.colors.status.error,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontFamily: {
        sans: tokens.typography.fontFamily.split(",").map((s) => s.trim()),
      },
      fontSize: tokens.typography.sizes,
      fontWeight: tokens.typography.weights,
      boxShadow: tokens.shadows,
    },
  },
  plugins: [],
};

export default config;
