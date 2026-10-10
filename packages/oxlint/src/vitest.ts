import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

const vitestPlugins: NonNullable<OxlintConfig["plugins"]> = ["vitest"];

const vitest: OxlintConfig = defineConfig({
  plugins: vitestPlugins,
});

export default vitest;

export { vitestPlugins };
