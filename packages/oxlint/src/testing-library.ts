import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { testingLibraryRules } from "./_rules-testing-library.ts";

export const testingLibraryJsPlugins: ExternalPluginEntry[] = [
  { name: "testing-library", specifier: resolvePlugin("eslint-plugin-testing-library") },
];

export const testingLibraryRulesFinal: DummyRuleMap = prefixed(
  "testing-library",
  testingLibraryRules,
);

const testingLibrary: OxlintConfig = defineConfig({
  jsPlugins: testingLibraryJsPlugins,
  rules: testingLibraryRulesFinal,
});

export default testingLibrary;
