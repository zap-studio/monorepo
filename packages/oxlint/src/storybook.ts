import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { storybookRules } from "./_rules-storybook.ts";

const storybookJsPlugins: ExternalPluginEntry[] = [
  { name: "storybook", specifier: resolvePlugin("eslint-plugin-storybook") },
];

const storybookRulesFinal: DummyRuleMap = prefixed("storybook", storybookRules);

const storybook: OxlintConfig = defineConfig({
  jsPlugins: storybookJsPlugins,
  rules: storybookRulesFinal,
});

export default storybook;

export { storybookJsPlugins, storybookRulesFinal };
