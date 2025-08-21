import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";
import drizzlePlugin from "eslint-plugin-drizzle";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.extends("next/core-web-vitals", "next/typescript"), ...pluginQuery.configs["flat/recommended"], {
  plugins: {
    drizzle: drizzlePlugin,
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    ...drizzlePlugin.configs.recommended.rules,
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
}];

export default eslintConfig;
