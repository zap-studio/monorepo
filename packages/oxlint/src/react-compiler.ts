import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import react from "./react.ts";

export const reactCompilerRules: DummyRuleMap = {
  "react/react-compiler": "error",
};

const reactCompiler: OxlintConfig = defineConfig({
  extends: [react],
  rules: reactCompilerRules,
});

export default reactCompiler;
