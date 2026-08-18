import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  attw: { profile: "esm-only" },
  dts: true,
  entry: ["src/**/*.ts", "!src/**/_*.ts", "!src/anti-slop/**", "!**/*.test.ts", "!**/*.spec.ts"],
  exports: {
    customExports(exports, { pkg }) {
      if (pkg.name === "@zap-studio/oxlint") {
        exports["./anti-slop"] = "./src/anti-slop/index.ts";
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
