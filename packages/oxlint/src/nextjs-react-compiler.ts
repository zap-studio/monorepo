import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { nextjsRules } from "./nextjs.ts";
import reactCompiler from "./react-compiler.ts";

const nextjsReactCompiler: OxlintConfig = defineConfig({
  extends: [reactCompiler],
  rules: nextjsRules,
});

export default nextjsReactCompiler;
