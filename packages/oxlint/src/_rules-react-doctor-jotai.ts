import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorJotaiRules: RuleMap = {
  "jotai-derived-atom-returns-fresh-object": "warn",
  "jotai-select-atom-in-render-body": "error",
  "jotai-tq-use-raw-query-atom": "warn",
};
