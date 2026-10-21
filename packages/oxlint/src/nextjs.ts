import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorNextjsRules } from "./_rules-react-doctor-nextjs.ts";

export const nextjsJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const nextjsRules: DummyRuleMap = prefixed("react-doctor", reactDoctorNextjsRules);

const nextjs: OxlintConfig = defineConfig({
  jsPlugins: nextjsJsPlugins,
  rules: nextjsRules,
});

export default nextjs;
