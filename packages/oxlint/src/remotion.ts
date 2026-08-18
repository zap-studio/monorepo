import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactDoctorRemotionRules } from "./_rules-react-doctor-remotion.ts";

export const remotionJsPlugins: ExternalPluginEntry[] = [
  { name: "react-doctor", specifier: resolvePlugin("oxlint-plugin-react-doctor") },
];

export const remotionRules: DummyRuleMap = prefixed("react-doctor", reactDoctorRemotionRules);

const remotion: OxlintConfig = defineConfig({
  jsPlugins: remotionJsPlugins,
  rules: remotionRules,
});

export default remotion;
