import { sharedConfig } from "@zap-studio/vitest-config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    projects: ["packages/*"],
  },
});
