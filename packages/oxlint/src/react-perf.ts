import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const reactPerfPlugins: NonNullable<OxlintConfig["plugins"]> = ["react-perf"];

export const reactPerfRules: DummyRuleMap = {
  "react-perf/jsx-no-jsx-as-prop": "warn",
  "react-perf/jsx-no-new-array-as-prop": "warn",
  "react-perf/jsx-no-new-function-as-prop": "warn",
  "react-perf/jsx-no-new-object-as-prop": "warn",
};

const reactPerf: OxlintConfig = defineConfig({
  plugins: reactPerfPlugins,
  rules: reactPerfRules,
});

export default reactPerf;
