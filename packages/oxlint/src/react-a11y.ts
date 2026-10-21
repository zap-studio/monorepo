import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import { prefixed } from "./_prefixed.ts";
import { resolvePlugin } from "./_resolve.ts";
import { reactA11yRules } from "./_rules-react-a11y.ts";

export const reactA11yPlugins: NonNullable<OxlintConfig["plugins"]> = ["jsx-a11y"];

export const reactA11yJsPlugins: ExternalPluginEntry[] = [
  { name: "github", specifier: resolvePlugin("eslint-plugin-github") },
];

// the 4 checks below have no jsx-a11y equivalent — eslint-plugin-github reimplements
// them independently, so they're pulled in here rather than left stranded in `base`
// (which assumes no UI framework) or duplicated in react-doctor
export const reactA11yRulesFinal: DummyRuleMap = {
  ...prefixed("jsx-a11y", reactA11yRules),
  "github/a11y-aria-label-is-well-formatted": "error",
  "github/a11y-no-title-attribute": "error",
  "github/a11y-no-visually-hidden-interactive-element": "error",
  "github/a11y-svg-has-accessible-name": "error",
};

const reactA11y: OxlintConfig = defineConfig({
  plugins: reactA11yPlugins,
  jsPlugins: reactA11yJsPlugins,
  rules: reactA11yRulesFinal,
});

export default reactA11y;
