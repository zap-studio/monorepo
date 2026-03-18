import { configDefaults, defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: true,
    entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
      exclude: [...configDefaults.exclude, "**/dist/**"],
    },
    environment: "node",
    globals: true,
    reporters: process.env.CI ? ["dot", "junit"] : ["default"],
    outputFile: process.env.CI ? { junit: "./coverage/junit.xml" } : undefined,
    restoreMocks: true,
    exclude: ["dist", "node_modules"],
  },
});
