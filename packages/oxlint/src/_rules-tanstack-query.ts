import type { RuleMap } from "./_prefixed.ts";

export const tanstackQueryRules = {
  "exhaustive-deps": "error",
  "infinite-query-property-order": "error",
  "mutation-property-order": "error",
  "no-rest-destructuring": "warn",
  "no-unstable-deps": "error",
  "no-void-query-fn": "error",
  "prefer-query-options": "error",
  "stable-query-client": "error",
} satisfies RuleMap;
