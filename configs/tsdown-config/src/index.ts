import { defineConfig } from "tsdown";

export function createConfig(overrides = {}) {
  return defineConfig({
    dts: true,
    entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
    ...overrides,
  });
}
