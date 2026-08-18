import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorNextjsRules } from "./_rules-react-doctor-nextjs.ts";
import react from "./react.ts";

export const nextjsRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorNextjsRules),
};

const nextjs: OxlintConfig = defineConfig({
  extends: [react],
  rules: nextjsRules,
});

export default nextjs;
