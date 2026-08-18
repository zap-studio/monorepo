import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const jsxRuntimeAutomaticPlugins: NonNullable<OxlintConfig["plugins"]> = ["react"];

export const jsxRuntimeAutomaticRules: DummyRuleMap = {
  "react/react-in-jsx-scope": "off",
};

const jsxRuntimeAutomatic: OxlintConfig = defineConfig({
  plugins: jsxRuntimeAutomaticPlugins,
  rules: jsxRuntimeAutomaticRules,
});

export default jsxRuntimeAutomatic;
