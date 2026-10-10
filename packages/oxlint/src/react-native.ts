import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorReactNativeRules } from "./_rules-react-doctor-react-native.ts";

const reactNativeJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

const reactNativeRules: DummyRuleMap = prefixed("react-doctor", reactDoctorReactNativeRules);

const reactNative: OxlintConfig = defineConfig({
  jsPlugins: reactNativeJsPlugins,
  rules: reactNativeRules,
});

export default reactNative;

export { reactNativeJsPlugins, reactNativeRules };
