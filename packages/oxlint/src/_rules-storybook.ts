import type { RuleMap } from "./_prefixed.ts";

export const storybookRules: RuleMap = {
  "await-interactions": "error",
  "context-in-play-function": "error",
  "default-exports": "error",
  "no-renderer-packages": "error",
  "no-stories-of": "error",
  "no-uninstalled-addons": "error",
  "story-exports": "error",
  "use-storybook-expect": "error",
  "use-storybook-testing-library": "error",

  // component-declaration convention, opt-in beyond baseline `recommended`
  "csf-component": "warn",
  // naming convention, not a broken story
  "hierarchy-separator": "warn",
  // opt-in analyzability convention, upstream ships it excluded from every bundled config
  "meta-inline-properties": "warn",
  // TS style preference, autofixable, upstream ships it excluded from every bundled config
  "meta-satisfies-type": "warn",
  // naming convention, not a broken story
  "no-redundant-story-name": "warn",
  // discouraged in CSF3 but harmless, autofixable
  "no-title-property-in-meta": "warn",
  // naming convention, not a broken story
  "prefer-pascal-case": "warn",
};
