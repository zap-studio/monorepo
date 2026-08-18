import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorStyledComponentsRules } from "./_rules-react-doctor-styled-components.ts";
import react from "./react.ts";

export const styledComponentsRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorStyledComponentsRules),
};

const styledComponents: OxlintConfig = defineConfig({
  extends: [react],
  rules: styledComponentsRules,
});

export default styledComponents;
