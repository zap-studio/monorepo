import type { RuleMap } from "./_prefixed.ts";

export const stylexRules: RuleMap = {
  "no-conflicting-props": "error",
  "no-nonstandard-styles": "error",
  "valid-shorthands": "error",
  "valid-styles": "error",

  // deprecated syntax that still compiles; nudge toward the new conditional-value form
  "no-legacy-contextual-styles": "warn",
  // :has()-reliant APIs; broad browser support now, but still worth a nudge, not a hard block
  "no-lookahead-selectors": "warn",
  // dead code, autofixable, not a correctness break
  "no-unused": "warn",
  // pure key-ordering convention
  "sort-keys": "warn",
  // only bites once a project adopts the .stylex.ts theme-file convention
  "enforce-extension": "warn",
};
