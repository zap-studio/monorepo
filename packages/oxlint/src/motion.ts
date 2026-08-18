import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorMotionRules } from "./_rules-react-doctor-motion.ts";
import react from "./react.ts";

export const motionRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorMotionRules),
};

const motion: OxlintConfig = defineConfig({
  extends: [react],
  rules: motionRules,
});

export default motion;
