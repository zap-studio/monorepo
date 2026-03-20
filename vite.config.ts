import { configDefaults, defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
  },
  run: {
    tasks: {
      "repo:build": {
        command: "vp run --filter ./packages/* --filter ./apps/docs build",
      },
      "repo:validate": {
        command: "vp check && vp test",
        dependsOn: ["repo:build"],
        cache: false,
      },
    },
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
