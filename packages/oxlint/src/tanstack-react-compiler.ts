import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import reactCompiler from "./react-compiler.ts";
import { tanstackJsPlugins, tanstackRules } from "./tanstack.ts";

const tanstackReactCompiler: OxlintConfig = defineConfig({
  extends: [reactCompiler],
  jsPlugins: tanstackJsPlugins,
  rules: tanstackRules,
});

export default tanstackReactCompiler;
