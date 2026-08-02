import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const isCI = process.env.CI !== undefined;
const exclude = [...configDefaults.exclude, "**/dist/**"];

export default defineConfig({
  test: {
    coverage: {
      exclude: [...exclude],
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
    },
    exclude,
    globals: true,
    outputFile: isCI ? { junit: "./coverage/junit.xml" } : undefined,
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["packages/**/*.node.test.ts"],
          name: { color: "green", label: "node" },
        },
      },
      {
        extends: true,
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          include: ["packages/**/*.browser.test.ts"],
          name: { color: "cyan", label: "browser" },
        },
      },
    ],
    reporters: isCI ? ["dot", "junit"] : ["default"],
    restoreMocks: true,
  },
});
