import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

export const jsdocPlugins: NonNullable<OxlintConfig["plugins"]> = ["jsdoc"];

const jsdoc: OxlintConfig = defineConfig({
  plugins: jsdocPlugins,
});

export default jsdoc;
