import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorMotionRules } from "./_rules-react-doctor-motion.ts";

const motionJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

const motionRules: DummyRuleMap = prefixed("react-doctor", reactDoctorMotionRules);

const motion: OxlintConfig = defineConfig({
  jsPlugins: motionJsPlugins,
  rules: motionRules,
});

export default motion;

export { motionJsPlugins, motionRules };
