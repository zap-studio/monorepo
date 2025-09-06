import type { Ora } from "ora";
import { ProcessExitError } from "@/lib/errors.js";
import type { PackageManager } from "@/schemas/package-manager.schema.js";
import { execAsync } from "@/utils/index.js";
import { getErrorMessage } from "@/utils/misc/error.js";
import { promptPackageManagerSelection } from "./prompts.js";

export function getInstallCommand(
  pm: PackageManager
): "yarn" | "npm install --legacy-peer-deps" | "pnpm install" | "bun install" {
  switch (pm) {
    case "npm":
      return "npm install --legacy-peer-deps";
    case "yarn":
      return "yarn";
    case "pnpm":
      return "pnpm install";
    case "bun":
      return "bun install";
    default:
      return "npm install --legacy-peer-deps";
  }
}

export function installDependenciesWithRetry(
  params: {
    outputDir: string;
    initialPM: PackageManager;
  },
  spinner: Ora
): Promise<"npm" | "yarn" | "pnpm" | "bun"> {
  const maxRetries = 3;
  let currentPM: PackageManager = params.initialPM;

  const attemptInstall = async (retryCount: number) => {
    spinner.text = `Installing dependencies with ${currentPM}...`;
    spinner.start();

    const installCmd = getInstallCommand(currentPM);

    try {
      await execAsync(installCmd, { cwd: params.outputDir });
      spinner.succeed(`Dependencies installed with ${currentPM}.`);
      return currentPM;
    } catch {
      spinner.fail(`Failed to install dependencies with ${currentPM}.`);

      if (retryCount >= maxRetries) {
        throw new ProcessExitError(
          `Failed to install dependencies after ${maxRetries} attempts. Please try installing manually.`
        );
      }

      spinner.text = `Switching to ${currentPM}...`;
      currentPM = await promptPackageManagerSelection(
        `${currentPM} failed. Which package manager would you like to try?`
      );
      return attemptInstall(retryCount + 1);
    }
  };

  return attemptInstall(0);
}

export async function updateDependencies(
  params: {
    outputDir: string;
    packageManager: PackageManager;
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    spinner.text = "Updating dependencies...";
    spinner.start();

    await execAsync(`${params.packageManager} update`, {
      cwd: params.outputDir,
    });
    spinner.succeed("Dependencies updated successfully.");
  } catch (error) {
    spinner.warn("Failed to update dependencies, continuing anyway...");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}
