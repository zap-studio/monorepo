import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: true,
    entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
  },
});
