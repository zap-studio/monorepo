import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    cache: {
      scripts: true,
    },
  },
  staged: {
    "*.{js,jsx,ts,tsx,json,jsonc,css}": "vp check --fix",
  },
  test: {
    projects: ["packages/*"],
  },
});
