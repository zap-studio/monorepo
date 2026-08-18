import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorRules } from "./_rules-react-doctor.ts";
import base from "./base.ts";

export const reactPlugins: NonNullable<OxlintConfig["plugins"]> = [
  "react",
  "react-perf",
  "jsx-a11y",
];

export const reactJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const reactRules: DummyRuleMap = {
  "react/rules-of-hooks": "error",
  "react/exhaustive-deps": "error",
  ...prefixed("react-doctor", reactDoctorRules),
};

const react: OxlintConfig = defineConfig({
  extends: [base],
  plugins: reactPlugins,
  jsPlugins: reactJsPlugins,
  rules: reactRules,
});

export default react;
