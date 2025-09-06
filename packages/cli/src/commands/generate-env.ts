import chalk from "chalk";
import ora from "ora";
import { FileSystemError } from "@/lib/errors.js";
import { displayNextSteps } from "@/utils/cli/cli.js";
import { generateEnv as generateEnvironment } from "@/utils/commands/generate/env/generate-env.js";

export async function generateEnv(filename = ".env.template"): Promise<void> {
  const spinner = ora("Generating environment file...").start();
  const outputDir = process.cwd();

  try {
    await generateEnvironment({ outputDir, filename });
    spinner.text = `Environment file ${chalk.green(filename)} generated successfully`;
    spinner.succeed();

    displayNextSteps(filename);
  } catch (error) {
    spinner.fail("Failed to generate environment file");
    throw new FileSystemError(`Failed to write environment file: ${error}`);
  }
}
