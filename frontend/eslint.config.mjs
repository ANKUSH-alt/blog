import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Allow setState inside useEffect - necessary pattern for client-side hydration
      "react-hooks/set-state-in-effect": "off",
      // Allow 'any' type - pragmatic for dynamic API responses and third-party libs
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unused vars as warnings only (not errors)
      "@typescript-eslint/no-unused-vars": "warn",
      // Allow <img> tag - we handle optimization manually for dynamic URLs
      "@next/next/no-img-element": "off",
    }
  }
]);

export default eslintConfig;
