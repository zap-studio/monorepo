import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorValtioRules } from "./_rules-react-doctor-valtio.ts";
import react from "./react.ts";

export const valtioRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorValtioRules),
};

const valtio: OxlintConfig = defineConfig({
  extends: [react],
  rules: valtioRules,
});

export default valtio;
