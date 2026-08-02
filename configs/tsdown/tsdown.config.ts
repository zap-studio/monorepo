import { defineConfig } from "tsdown";

export default defineConfig({
  attw: { profile: "esm-only" },
  dts: true,
  entry: ["src/**/*.ts", "!**/*.test.ts", "!**/*.spec.ts"],
  exports: true,
  platform: "neutral",
  publint: true,
  unused: true,
});
