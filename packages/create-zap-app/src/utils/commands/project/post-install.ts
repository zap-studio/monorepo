import chalk from 'chalk';
import type { Ora } from 'ora';
import { GITHUB_REPO_URL } from '@/data/website.js';
import type { PackageManager } from '@/schemas/package-manager.schema.js';
import { generateEnv } from '@/utils/generation/generate-env.js';
import { execAsync } from '@/utils/index.js';

export async function runFormatting(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
): Promise<void> {
  try {
    spinner.text = 'Formatting the project...';
    spinner.start();

    await execAsync(`${packageManager} run format`, {
      cwd: outputDir,
    });

    spinner.succeed('Formatting complete.');
  } catch {
    spinner.warn('Failed to run formatting, continuing anyway...');
  }
}

export async function generateEnvFile(
  outputDir: string,
  spinner: Ora
): Promise<void> {
  spinner.text = 'Generating .env file...';
  spinner.start();

  await generateEnv({ outputDir, spinner });
}

export function displaySuccessMessage(
  projectName: string,
  packageManager: PackageManager
): void {
  process.stdout.write(chalk.green('Project setup complete!'));
  process.stdout.write('\n\n');
  process.stdout.write(chalk.bold.green('🎉 Project created successfully!'));
  process.stdout.write('\n\n');
  process.stdout.write(
    chalk.yellow(
      '⚠️ After installation, please ensure you populate the .env file with the required values to get started.'
    )
  );
  process.stdout.write('\n\n');
  process.stdout.write(chalk.cyan('Get started:\n'));
  process.stdout.write(chalk.white(`  cd ${projectName}\n`));
  process.stdout.write(chalk.white(`  ${packageManager} dev\n\n`));

  process.stdout.write(
    chalk.magentaBright(
      '🌟 If you like this project, consider giving it a star on GitHub!\n'
    )
  );
  process.stdout.write(chalk.white(`👉 ${GITHUB_REPO_URL}\n`));
}
