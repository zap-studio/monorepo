import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorZustandRules = {
  "zustand-no-fresh-selector-result": "error",
  "zustand-no-get-during-initialization": "error",
  "zustand-no-mutating-state": "error",
  "zustand-no-whole-store-destructure": "warn",
} satisfies RuleMap;
