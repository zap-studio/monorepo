import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorMobxRules } from "./_rules-react-doctor-mobx.ts";
import react from "./react.ts";

export const mobxRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorMobxRules),
};

const mobx: OxlintConfig = defineConfig({
  extends: [react],
  rules: mobxRules,
});

export default mobx;
