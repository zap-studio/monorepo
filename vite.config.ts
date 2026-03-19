import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    tasks: {
      "repo:build": {
        command: "vp run --filter ./packages/* --filter ./apps/docs build",
      },
      "repo:test": {
        command: "vp run --filter ./packages/* test",
      },
      "repo:test:ci": {
        command: "CI=1 vp run --filter ./packages/* test",
        cache: false,
      },
      "repo:test:coverage": {
        command:
          "CI=1 vp run --filter ./packages/* test -- --coverage && vp run merge-coverage && vp run report-coverage",
        cache: false,
      },
      "repo:validate": {
        command: "vp check && vp run --filter ./packages/* test",
        dependsOn: ["repo:build"],
        cache: false,
      },
    },
  },
  staged: {
    "*.{js,jsx,ts,tsx,json,jsonc,css}": "vp check --fix",
  },
  test: {
    projects: ["packages/*"],
  },
});
