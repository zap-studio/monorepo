import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const jsxRuntimeClassicPlugins: NonNullable<OxlintConfig["plugins"]> = ["react"];

export const jsxRuntimeClassicRules: DummyRuleMap = {
  "react/react-in-jsx-scope": "warn",
};

const jsxRuntimeClassic: OxlintConfig = defineConfig({
  plugins: jsxRuntimeClassicPlugins,
  rules: jsxRuntimeClassicRules,
});

export default jsxRuntimeClassic;
