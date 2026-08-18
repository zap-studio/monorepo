import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorJotaiRules } from "./_rules-react-doctor-jotai.ts";

export const jotaiJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const jotaiRules: DummyRuleMap = prefixed("react-doctor", reactDoctorJotaiRules);

const jotai: OxlintConfig = defineConfig({
  jsPlugins: jotaiJsPlugins,
  rules: jotaiRules,
});

export default jotai;
