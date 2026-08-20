import type { RuleMap } from "./_prefixed.ts";

export const jestDomRules: RuleMap = {
  "prefer-checked": "error",
  "prefer-empty": "error",
  "prefer-enabled-disabled": "error",
  "prefer-focus": "error",
  "prefer-in-document": "error",
  "prefer-required": "error",
  "prefer-to-have-attribute": "error",
  "prefer-to-have-class": "error",
  "prefer-to-have-style": "error",
  "prefer-to-have-text-content": "error",
  "prefer-to-have-value": "error",

  // not yet in upstream's own recommended config (planned for their next major)
  "prefer-pressed": "warn",
};
