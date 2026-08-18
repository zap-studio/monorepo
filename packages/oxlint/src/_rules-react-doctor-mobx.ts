import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorMobxRules = {
  "mobx-no-make-auto-observable-in-inheritance": "error",
  "mobx-no-observer-wrapped-memo": "error",
  "mobx-reaction-disposer-discarded": "warn",
} satisfies RuleMap;
