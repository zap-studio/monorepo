import type { DummyRuleMap, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { reactDoctorReactRouterRules } from "./_rules-react-doctor-react-router.ts";
import react from "./react.ts";

export const reactRouterRules: DummyRuleMap = {
  ...prefixed("react-doctor", reactDoctorReactRouterRules),
};

const reactRouter: OxlintConfig = defineConfig({
  extends: [react],
  rules: reactRouterRules,
});

export default reactRouter;
