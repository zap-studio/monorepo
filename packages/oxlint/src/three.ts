import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorThreeRules } from "./_rules-react-doctor-three.ts";
import react from "./react.ts";

export const threeRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorThreeRules),
};

const three: OxlintConfig = defineConfig({
  extends: [react],
  rules: threeRules,
});

export default three;
