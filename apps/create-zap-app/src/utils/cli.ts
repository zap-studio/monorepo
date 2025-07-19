import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import figlet from 'figlet';

/**
 * Reads the version from package.json file.
 * @returns The version string from package.json
 */
export async function getPackageVersion(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return packageJson.version;
}

/**
 * Displays a welcome banner with the Zap.ts logo and introduction message.
 * Uses figlet to create an ASCII art banner and chalk for colored output.
 */
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

/**
 * Displays an error message to stderr with red formatting.
 * @param error - The error to display. Can be an Error object or any other value.
 */
export function displayError(error: unknown) {
  process.stderr.write(
    chalk.bold.red('\n❌ An error occurred: ') +
      (error instanceof Error ? error.message : String(error))
  );
}

/**
 * Displays a success message to stdout with green formatting.
 * @param message - The success message to display.
 */
export function displaySuccess(message: string) {
  process.stdout.write(chalk.green(message));
}

/**
 * Displays an informational message to stdout with cyan formatting.
 * @param message - The informational message to display.
 */
export function displayInfo(message: string) {
  process.stdout.write(chalk.cyan(message));
}

/**
 * Displays a warning message to stdout with yellow formatting.
 * @param message - The warning message to display.
 */
export function displayWarning(message: string) {
  process.stdout.write(chalk.yellow(message));
}
