import type { OxfmtConfig } from "oxfmt";

import { defineConfig } from "oxfmt";

const base: OxfmtConfig = defineConfig({
  sortImports: {
    groups: [
      "type-import",
      ["value-builtin", "value-external"],
      "type-internal",
      "value-internal",
      ["type-parent", "type-sibling", "type-index"],
      ["value-parent", "value-sibling", "value-index"],
      "unknown",
    ],
    newlinesBetween: true,
  },
  sortPackageJson: {
    sortScripts: true,
  },
});

export default base;
