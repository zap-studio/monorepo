import { sharedConfig } from "@zap-studio/vitest-config";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  sharedConfig,
  defineConfig({
    test: {
      projects: ["packages/*"],
    },
  }),
);
