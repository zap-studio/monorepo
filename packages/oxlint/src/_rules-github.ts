import type { RuleMap } from "./_prefixed.ts";

export const githubRules = {
  "a11y-aria-label-is-well-formatted": "error",
  "a11y-no-title-attribute": "error",
  "a11y-no-visually-hidden-interactive-element": "error",
  "a11y-role-supports-aria-props": "error",
  "a11y-svg-has-accessible-name": "error",
  "array-foreach": "error",
  "async-currenttarget": "error",
  "async-preventdefault": "error",
  "authenticity-token": "error",
  "get-attribute": "error",
  "js-class-name": "error",
  "no-blur": "error",
  "no-d-none": "error",
  "no-dynamic-script-tag": "error",
  "no-implicit-buggy-globals": "error",
  "no-inner-html": "error",
  "no-innerText": "error",
  "no-then": "error",
  "no-useless-passive": "error",
  "prefer-observers": "error",
  "require-passive-events": "error",
  "unescaped-html-literal": "error",

  // deprecated upstream, replaced by jsx-a11y/anchor-ambiguous-text (already enabled via the react preset)
  "a11y-no-generic-link-text": "off",
  // default regex enforces camelCase filenames; this repo is kebab-case, and our
  // rule-map shape here carries a severity string only, not rule options/regex
  "filenames-match-regex": "off",
  // pushes getAttribute('data-*') over .dataset for old-browser compat; every
  // runtime these packages target supports .dataset fine
  "no-dataset": "off",
} satisfies RuleMap;
