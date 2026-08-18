import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorZustandRules } from "./_rules-react-doctor-zustand.ts";
import react from "./react.ts";

export const zustandRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorZustandRules),
};

const zustand: OxlintConfig = defineConfig({
  extends: [react],
  rules: zustandRules,
});

export default zustand;
