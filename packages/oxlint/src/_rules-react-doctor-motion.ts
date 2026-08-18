import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorMotionRules = {
  "motion-animate-presence-must-outlive-child": "warn",
  "motion-animate-presence-requires-key": "warn",
  "motion-animate-presence-wait-single-child": "warn",
  "motion-create-in-render": "warn",
  "motion-drag-axis-constraint-mismatch": "warn",
  "motion-imperative-animation-in-render": "error",
  "motion-keyframe-times-mismatch": "error",
  "motion-layout-on-inline-element": "warn",
  "motion-unstable-layout-id-in-iteration": "warn",
  "motion-use-transform-range-length": "error",
  "motion-value-constructor-in-render": "warn",
  "motion-value-subscription-in-render": "error",
} satisfies RuleMap;
