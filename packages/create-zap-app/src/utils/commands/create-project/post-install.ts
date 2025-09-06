import chalk from "chalk";
import type { Ora } from "ora";
import { GITHUB_REPO_URL } from "@/data/website.js";
import type { PackageManager } from "@/schemas/package-manager.schema.js";
import { generateEnv } from "@/utils/generation/generate-env.js";
import { execAsync } from "@/utils/index.js";
import { getErrorMessage } from "@/utils/misc/error";

export async function runFormatting(
  params: {
    outputDir: string;
    packageManager: PackageManager;
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    spinner.text = "Formatting the project...";
    spinner.start();

    await execAsync(`${params.packageManager} run format`, {
      cwd: params.outputDir,
    });

    spinner.succeed("Formatting complete.");
  } catch (error) {
    spinner.warn("Failed to run formatting, continuing anyway...");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}

export async function generateEnvFile(
  params: {
    outputDir: string;
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    spinner.text = "Generating .env file...";
    spinner.start();

    await generateEnv({ outputDir: params.outputDir, spinner });
  } catch (error) {
    spinner.warn(
      "Unable to generate .env file. You can run `zap generate env` with @zap-ts/cli to create it. Proceeding with setup..."
    );
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}

export function displaySuccessMessage(params: {
  projectName: string;
  packageManager: PackageManager;
}): void {
  process.stdout.write(chalk.green("Project setup complete!"));
  process.stdout.write("\n\n");
  process.stdout.write(chalk.bold.green("🎉 Project created successfully!"));
  process.stdout.write("\n\n");
  process.stdout.write(
    chalk.yellow(
      "⚠️ After installation, please ensure you populate the .env file with the required values to get started."
    )
  );
  process.stdout.write("\n\n");
  process.stdout.write(chalk.cyan("Get started:\n"));
  process.stdout.write(chalk.white(`  cd ${params.projectName}\n`));
  process.stdout.write(chalk.white(`  ${params.packageManager} dev\n\n`));

  process.stdout.write(
    chalk.magentaBright(
      "🌟 If you like this project, consider giving it a star on GitHub!\n"
    )
  );
  process.stdout.write(chalk.white(`👉 ${GITHUB_REPO_URL}\n`));
}
