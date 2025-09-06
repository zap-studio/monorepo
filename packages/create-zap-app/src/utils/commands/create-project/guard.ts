import fs from "fs-extra";

export async function isAlreadyZapApp(dir: string): Promise<boolean> {
  const files = await fs.readdir(dir);
  return files.includes("zap.config.ts");
}
