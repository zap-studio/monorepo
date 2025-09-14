import type { UserConfig } from "tsdown";

export const bundlerConfig: UserConfig = {
  entry: ["src/**"],
  dts: true,
  exports: true,
  sourcemap: true,
};
