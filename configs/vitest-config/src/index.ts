export const config = {
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8" as const,
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
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
