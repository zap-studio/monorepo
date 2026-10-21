import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorTanstackStartRules } from "./_rules-react-doctor-tanstack-start.ts";

export const tanstackStartJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const tanstackStartRules: DummyRuleMap = prefixed(
  "react-doctor",
  reactDoctorTanstackStartRules,
);

const tanstackStart: OxlintConfig = defineConfig({
  jsPlugins: tanstackStartJsPlugins,
  rules: tanstackStartRules,
});

export default tanstackStart;
