import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorTanstackStartRules: RuleMap = {
  "tanstack-start-get-mutation": "warn",
  "tanstack-start-loader-parallel-fetch": "warn",
  "tanstack-start-missing-head-content": "warn",
  "tanstack-start-missing-scripts": "warn",
  "tanstack-start-no-anchor-element": "warn",
  "tanstack-start-no-direct-fetch-in-loader": "warn",
  "tanstack-start-no-dynamic-server-fn-import": "error",
  "tanstack-start-no-navigate-in-render": "warn",
  "tanstack-start-no-secrets-in-loader": "error",
  "tanstack-start-no-use-server-in-handler": "error",
  "tanstack-start-no-useeffect-fetch": "warn",
  "tanstack-start-redirect-in-try-catch": "warn",
  "tanstack-start-route-property-order": "error",
  "tanstack-start-server-fn-method-order": "error",
  "tanstack-start-server-fn-validate-input": "warn",
};
