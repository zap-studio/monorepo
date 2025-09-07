import chalk from "chalk";
import fs from "fs-extra";

export async function isAlreadyZapApp(dir: string): Promise<boolean> {
  const files = await fs
    .readdir(dir)
    .catch(() => [])
    .then((list) => list.map((f) => f.toLowerCase()));
  return files.includes("zap.config.ts");
}

export async function isDirectoryEmpty(dir: string): Promise<boolean> {
  const files = await fs.readdir(dir).catch(() => []);
  return files.length === 0;
}

export async function ensureDirectoryIsReady(options: {
  outputDir: string;
  projectName: string;
}): Promise<void> {
  const { outputDir, projectName } = options;

  const isZapApp = await isAlreadyZapApp(outputDir);
  if (isZapApp) {
    process.stdout.write(
      chalk.red(`Project '${projectName}' is already a Zap.ts app.`)
    );
    return;
  }

  const isDirEmpty = await isDirectoryEmpty(outputDir);
  if (!isDirEmpty) {
    process.stdout.write(
      chalk.red(
        `Project directory '${outputDir}' is not empty. Please choose another directory or remove existing files.`
      )
    );
    return;
  }
}
