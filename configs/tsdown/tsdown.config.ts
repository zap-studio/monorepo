import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  attw: { profile: "esm-only" },
  dts: true,
  entry: ["src/**/*.ts", "!src/**/_*.ts", "!**/*.test.ts", "!**/*.spec.ts"],
  exports: true,
  platform: "neutral",
  publint: true,
  unused: true,
  workspace: { include: [`${repoRoot}packages/*`] },
});
