import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorReactRouterRules } from "./_rules-react-doctor-react-router.ts";

export const reactRouterJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const reactRouterRules: DummyRuleMap = prefixed("react-doctor", reactDoctorReactRouterRules);

const reactRouter: OxlintConfig = defineConfig({
  jsPlugins: reactRouterJsPlugins,
  rules: reactRouterRules,
});

export default reactRouter;
