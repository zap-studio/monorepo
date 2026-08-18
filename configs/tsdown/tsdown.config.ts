import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  attw: { profile: "esm-only" },
  dts: true,
  entry: [
    "src/**/*.ts",
    "!src/**/_*.ts",
    "!src/anti-slop/rules/**",
    "!src/anti-slop/shared/**",
    "!**/*.test.ts",
    "!**/*.spec.ts",
  ],
  deps: { neverBundle: [/^node:/u] },
  exports: {
    customExports(exports, { pkg }) {
      if (pkg.name === "@zap-studio/oxlint") {
        exports["./anti-slop"] = "./dist/anti-slop/index.js";
      }
      return exports;
    },
  },
  platform: "neutral",
  publint: true,
  unused: {
    ignore: ["@oxlint/plugins", "oxlint-tsgolint"],
  },
  workspace: { include: [`${repoRoot}packages/*`] },
});
