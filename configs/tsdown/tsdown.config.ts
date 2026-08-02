import { defineConfig } from "tsdown";

export default defineConfig({
  attw: { level: "error", profile: "esm-only" },
  dts: true,
  entry: ["src/**/*.ts", "!**/*.test.ts", "!**/*.spec.ts"],
  exports: true,
  platform: "neutral",
  publint: true,
  unused: true,
});
