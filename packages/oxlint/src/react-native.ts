import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorReactNativeRules } from "./_rules-react-doctor-react-native.ts";
import react from "./react.ts";

export const reactNativeRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorReactNativeRules),
};

const reactNative: OxlintConfig = defineConfig({
  extends: [react],
  rules: reactNativeRules,
});

export default reactNative;
