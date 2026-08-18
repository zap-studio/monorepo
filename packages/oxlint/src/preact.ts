import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorPreactRules } from "./_rules-react-doctor-preact.ts";
import react from "./react.ts";

export const preactRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorPreactRules),
};

const preact: OxlintConfig = defineConfig({
  extends: [react],
  rules: preactRules,
});

export default preact;
