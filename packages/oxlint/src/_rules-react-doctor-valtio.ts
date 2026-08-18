import type { RuleMap } from "./_prefixed.ts";

export const reactDoctorValtioRules = {
  "valtio-no-proxy-read-in-render": "warn",
  "valtio-no-snapshot-in-callback": "warn",
} satisfies RuleMap;
