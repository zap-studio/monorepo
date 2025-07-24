import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import figlet from 'figlet';

export async function getPackageVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return packageJson.version;
}

export function displayWelcome() {
  process.stdout.write('\x1B[2J\x1B[0f');
  process.stdout.write('\n');
  const banner = figlet.textSync('Zap.ts', {
    font: 'ANSI Shadow',
  });

  process.stdout.write(
    chalk.bold.cyan(banner) +
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
      )
  );
}

export function displayError(error: unknown) {
  process.stderr.write(
    chalk.bold.red('\n❌ An error occurred: ') +
      (error instanceof Error ? error.message : String(error))
  );
}

export function displaySuccess(message: string) {
  process.stdout.write(chalk.green(message));
}

export function displayInfo(message: string) {
  process.stdout.write(chalk.cyan(message));
}

export function displayWarning(message: string) {
  process.stdout.write(chalk.yellow(message));
}
