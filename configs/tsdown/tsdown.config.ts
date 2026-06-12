import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
  format: "esm",
  outDir: "dist",
});
