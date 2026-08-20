import type { RuleMap } from "./_prefixed.ts";

export const solidRules: RuleMap = {
  "components-return-once": "warn",
  "event-handlers": "warn",
  imports: "warn",
  "jsx-no-duplicate-props": "error",
  "jsx-no-script-url": "error",
  "jsx-no-undef": "error",
  "jsx-uses-vars": "error",
  "no-destructure": "error",
  "no-innerhtml": "error",
  "no-react-deps": "warn",
  "no-react-specific-props": "warn",
  "prefer-for": "error",
  reactivity: "warn",
  "self-closing-comp": "warn",
  "style-prop": "warn",

  // TypeScript's own JSX namespace checking already covers this
  "no-unknown-namespaces": "off",
  // opinionated restriction on array-literal event handlers, off in the plugin's own recommended config
  "no-array-handlers": "off",
  // handled by the Solid compiler; opt-in style suggestion, not a correctness issue
  "prefer-show": "off",
  // only matters for resource-constrained (e.g. embedded) runtimes, not a general default
  "no-proxy-apis": "off",
  // deprecated by the plugin author
  "prefer-classlist": "off",
};
