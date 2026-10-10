import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorThreeRules } from "./_rules-react-doctor-three.ts";

const threeJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

const threeRules: DummyRuleMap = prefixed("react-doctor", reactDoctorThreeRules);

const three: OxlintConfig = defineConfig({
  jsPlugins: threeJsPlugins,
  rules: threeRules,
});

export default three;

export { threeJsPlugins, threeRules };
