import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

import react from "./react.ts";
import testing from "./testing.ts";

const full: OxlintConfig = defineConfig({
  extends: [react, testing],
});

export default full;
