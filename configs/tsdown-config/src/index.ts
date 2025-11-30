import { defineConfig } from "tsdown";

export function createConfig(overrides = {}) {
  return defineConfig({
    entry: ["src/**/*", "!src/internal/**", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
    dts: true,
    ...overrides,
  });
}
