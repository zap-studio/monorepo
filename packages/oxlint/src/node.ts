import type { OxlintConfig } from "oxlint";

import { defineConfig } from "oxlint";

const nodePlugins: NonNullable<OxlintConfig["plugins"]> = ["node"];

const node: OxlintConfig = defineConfig({
  plugins: nodePlugins,
});

export default node;

export { nodePlugins };
