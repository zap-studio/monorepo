import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorPreactRules } from "./_rules-react-doctor-preact.ts";

const preactJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

const preactRules: DummyRuleMap = prefixed("react-doctor", reactDoctorPreactRules);

const preact: OxlintConfig = defineConfig({
  jsPlugins: preactJsPlugins,
  rules: preactRules,
});

export default preact;

export { preactJsPlugins, preactRules };
