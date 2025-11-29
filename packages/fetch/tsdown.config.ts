import { createConfig } from "@zap-studio/tsdown-config";

export default createConfig({
  entry: ["src/index.ts", "src/errors.ts", "src/types.ts", "src/validator.ts"],
});
