import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorR3fRules } from "./_rules-react-doctor-r3f.ts";
import react from "./react.ts";

export const r3fRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorR3fRules),
};

const r3f: OxlintConfig = defineConfig({
  extends: [react],
  rules: r3fRules,
});

export default r3f;
