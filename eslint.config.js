// eslint.config.js (flat config for ESLint 9)
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Ignore build artifacts
  { ignores: ["dist", "node_modules", "coverage"] },

  // TypeScript rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // basic options are enough unless you need type-aware linting
        sourceType: "module",
        ecmaVersion: "latest"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // relax while we build InsightBox v2
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
