import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: true,
    entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
  },
  test: {
    environment: "node",
    globals: true,
    restoreMocks: true,
    exclude: ["dist", "node_modules"],
  },
});
