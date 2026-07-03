import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",

    // Generated, archived, and local operator workspaces.
    ".vercel/**",
    ".agents/**",
    ".claude/**",
    ".omo/**",
    ".opencode/**",
    "_archive/**",
    "artifacts/**",
    "scratch/**",
    "data/**",
    "docs/sources/**",
    "scripts/_deprecated_fake_data/**",
    "**/*.js",
    "lib/audio.ts",
    "components/UnloadingStatus.tsx"
  ]),
]);

export default eslintConfig;
