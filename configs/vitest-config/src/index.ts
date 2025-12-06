import { defineConfig, type ViteUserConfig } from "vitest/config";

export const sharedConfig: ViteUserConfig = {
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "dist/",
        "node_modules/",
        "**/*.config.{ts,js}",
        "**/*.d.ts",
        "**/test/**",
      ],
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next", ".turbo"],
  },
};

export function createConfig(overrides?: ViteUserConfig) {
  return defineConfig({ ...sharedConfig, ...overrides });
}
