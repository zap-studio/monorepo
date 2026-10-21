import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const reactPlugins: NonNullable<OxlintConfig["plugins"]> = ["react"];

export const reactRules: DummyRuleMap = {
  "react/rules-of-hooks": "error",
  "react/exhaustive-deps": "error",
};

const react: OxlintConfig = defineConfig({
  plugins: reactPlugins,
  rules: reactRules,
});

export default react;
