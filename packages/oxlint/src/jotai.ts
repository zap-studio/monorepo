import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorJotaiRules } from "./_rules-react-doctor-jotai.ts";
import react from "./react.ts";

export const jotaiRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorJotaiRules),
};

const jotai: OxlintConfig = defineConfig({
  extends: [react],
  rules: jotaiRules,
});

export default jotai;
