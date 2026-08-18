import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorTanstackQueryRules = {
  "query-destructure-result": "warn",
  "query-floating-mutate-async": "warn",
  "query-mutation-missing-invalidation": "warn",
  "query-no-mutation-in-effect-as-read": "warn",
  "query-no-query-in-effect": "warn",
  "query-no-rest-destructuring": "warn",
  "query-no-usequery-for-mutation": "warn",
  "query-no-void-query-fn": "warn",
  "query-stable-query-client": "warn",
} satisfies RuleMap;
