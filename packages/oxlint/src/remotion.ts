import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorRemotionRules } from "./_rules-react-doctor-remotion.ts";
import react from "./react.ts";

export const remotionRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorRemotionRules),
};

const remotion: OxlintConfig = defineConfig({
  extends: [react],
  rules: remotionRules,
});

export default remotion;
