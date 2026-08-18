import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { playwrightRules } from "./_rules-playwright.ts";
import base from "./base.ts";

export const testingPlugins: NonNullable<OxlintConfig["plugins"]> = ["vitest"];

export const testingJsPlugins: ExternalPluginEntry[] = [
  { name: "playwright", specifier: resolvePlugin("eslint-plugin-playwright") },
];

export const testingRules: DummyRuleMap = {
  ...prefixed("playwright", playwrightRules),
};

const testing: OxlintConfig = defineConfig({
  extends: [base],
  plugins: testingPlugins,
  jsPlugins: testingJsPlugins,
  rules: testingRules,
});

export default testing;
