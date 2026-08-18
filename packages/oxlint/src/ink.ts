import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorInkRules } from "./_rules-react-doctor-ink.ts";
import react from "./react.ts";

export const inkRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorInkRules),
};

const ink: OxlintConfig = defineConfig({
  extends: [react],
  rules: inkRules,
});

export default ink;
