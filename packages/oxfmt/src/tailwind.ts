import type { OxfmtConfig } from "oxfmt";

import { defineConfig } from "oxfmt";

import base from "./base.ts";

const tailwind: OxfmtConfig = defineConfig({
  ...base,
  sortTailwindcss: true,
});

export default tailwind;
