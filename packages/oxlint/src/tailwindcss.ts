import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { tailwindcssRules } from "./_rules-tailwindcss.ts";

export const tailwindcssJsPlugins: ExternalPluginEntry[] = [
  { name: "tailwindcss", specifier: resolvePlugin("eslint-plugin-tailwindcss") },
];

export const tailwindcssRulesFinal: DummyRuleMap = prefixed("tailwindcss", tailwindcssRules);

const tailwindcss: OxlintConfig = defineConfig({
  jsPlugins: tailwindcssJsPlugins,
  rules: tailwindcssRulesFinal,
});

export default tailwindcss;
