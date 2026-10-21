import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorInkRules } from "./_rules-react-doctor-ink.ts";

export const inkJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const inkRules: DummyRuleMap = prefixed("react-doctor", reactDoctorInkRules);

const ink: OxlintConfig = defineConfig({
  jsPlugins: inkJsPlugins,
  rules: inkRules,
});

export default ink;
