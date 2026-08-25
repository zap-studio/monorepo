import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const isCI = process.env.CI !== undefined;
const exclude = [...configDefaults.exclude, "**/dist/**", "**/package.json"];
const pureBarrelFiles = [
  "packages/oxlint/src/index.ts",
  "packages/react-hooks/src/index.ts",
  "packages/retry/src/index.ts",
];

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  test: {
    coverage: {
      exclude: [...exclude, ...pureBarrelFiles],
      provider: "v8",
      reporter: ["lcov", "text"],
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
    reporters: isCI ? ["junit"] : ["default"],
    restoreMocks: true,
  },
});
