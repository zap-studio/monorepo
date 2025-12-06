import {
  configDefaults,
  defineConfig,
  mergeConfig,
  type ViteUserConfig,
} from "vitest/config";

export const sharedConfig: ViteUserConfig = {
  test: {
    coverage: {
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
      exclude: [...configDefaults.exclude, "**/dist/**"],
    },
    environment: "node",
    globals: true,
    reporters: process.env.CI ? ["dot"] : ["default"],
    restoreMocks: true,
    exclude: ["dist", "node_modules", ".turbo"],
  },
};

export function createConfig(overrides?: ViteUserConfig) {
  return defineConfig(mergeConfig(sharedConfig, overrides ?? {}));
}
