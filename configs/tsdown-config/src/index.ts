import { defineConfig } from "tsdown";

export function createConfig(overrides = {}) {
  return defineConfig({
    dts: true,
    entry: ["src/**/*", "!src/internal/**", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
    ...overrides,
  });
}
