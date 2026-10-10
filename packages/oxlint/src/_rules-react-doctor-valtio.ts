import type { RuleMap } from "./_prefixed.ts";

const reactDoctorValtioRules: RuleMap = {
  "valtio-no-proxy-read-in-render": "warn",
  "valtio-no-snapshot-in-callback": "warn",
};

export { reactDoctorValtioRules };
