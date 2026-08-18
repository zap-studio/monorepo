import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const reactCompilerPlugins: NonNullable<OxlintConfig["plugins"]> = ["react"];

export const reactCompilerRules: DummyRuleMap = {
  "react/react-compiler": "error",
};

const reactCompiler: OxlintConfig = defineConfig({
  plugins: reactCompilerPlugins,
  rules: reactCompilerRules,
});

export default reactCompiler;
