import { existsSync } from "fs";
import { resolve } from "path";

export const alreadyInstalled = () => {
  if (existsSync(resolve(process.cwd(), "zap.config.ts"))) {
    console.error("zap.config.ts already exists. Aborting.");
    process.exit(1);
  }

  if (existsSync(resolve(process.cwd(), ".env.local"))) {
    console.error(".env.local already exists. Aborting to avoid overwriting.");
    process.exit(1);
  }
};
