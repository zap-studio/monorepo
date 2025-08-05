import chalk from 'chalk';
import type { Ora } from 'ora';
import type { PackageManager } from '@/schemas/package-manager.schema';
import { execAsync } from '@/utils';
import { generateEnv } from '@/utils/generation/generate-env';

export async function runPrettierFormatting(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  try {
    spinner.text = 'Running Prettier on the project...';
    spinner.start();

    await execAsync(`${packageManager} run format`, {
      cwd: outputDir,
    });

    spinner.succeed('Prettier formatting complete.');
  } catch {
    spinner.warn('Failed to run Prettier, continuing anyway...');
  }
}

export async function generateEnvFile(outputDir: string, spinner: Ora) {
  spinner.text = 'Generating .env file...';
  spinner.start();

  await generateEnv({ outputDir, spinner });
}

export function displaySuccessMessage(
  projectName: string,
  packageManager: PackageManager
) {
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
  process.stdout.write(
    chalk.white('👉 https://github.com/alexandretrotel/zap.ts\n')
  );
}
