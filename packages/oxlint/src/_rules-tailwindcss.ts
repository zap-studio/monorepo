import type { RuleMap } from "./_prefixed.ts";

export const tailwindcssRules = {
  "no-contradicting-classname": "error",

  // consistency preferences, all autofixable
  "classnames-order": "warn",
  "enforces-negative-arbitrary-values": "warn",
  "enforces-shorthand": "warn",
  "important-modifier-suffix": "warn",
  "no-unnecessary-arbitrary-value": "warn",

  // blanket-disallows all arbitrary values, too opinionated/disruptive as a shared default
  "no-arbitrary-value": "off",
  // needs the project's own tailwind config/design tokens wired into settings.tailwindcss.classnames,
  // otherwise flags every non-utility classname (cva variants, CSS module classes, third-party classnames)
  "no-custom-classname": "off",
} satisfies RuleMap;
