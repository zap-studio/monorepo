import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorReduxRules } from "./_rules-react-doctor-redux.ts";
import react from "./react.ts";

export const reduxRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorReduxRules),
};

const redux: OxlintConfig = defineConfig({
  extends: [react],
  rules: reduxRules,
});

export default redux;
