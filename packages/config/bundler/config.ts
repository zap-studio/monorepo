import type { UserConfig } from "tsdown";

export const bundlerConfig: UserConfig = {
  entry: ["src/**"],
  dts: {
    sourcemap: true,
  },
  format: ["cjs", "esm"],
  exports: true,
  shims: true,
  sourcemap: true,
};
