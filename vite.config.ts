import { configDefaults, defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "react",
      "react-perf",
      "oxc",
      "import",
      "jsdoc",
      "jsx-a11y",
      "node",
      "promise",
      "vitest",
    ],
  },
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
    sortImports: {},
    sortPackageJson: true,
    sortTailwindcss: {},
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
      exclude: [...configDefaults.exclude, "**/dist/**"],
    },
    environment: "node",
    exclude: ["dist", "node_modules"],
    globals: true,
    outputFile: process.env.CI ? { junit: "./coverage/junit.xml" } : undefined,
    projects: ["packages/*"],
    reporters: process.env.CI ? ["dot", "junit"] : ["default"],
    restoreMocks: true,
  },
});
