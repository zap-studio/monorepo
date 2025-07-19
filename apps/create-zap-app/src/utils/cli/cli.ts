import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import figlet from 'figlet';

/**
 * Reads the version from package.json file asynchronously.
 * Uses fs/promises to read the package.json file and extracts the version field.
 * @returns A promise that resolves to the version string from package.json
 * @throws {Error} If the package.json file cannot be read or parsed
 *
 * @example
 * ```typescript
 * import { getPackageVersion } from './cli';
 *
 * // Get the current package version
 * const version = await getPackageVersion();
 * console.log(`Current version: ${version}`);
 * // Outputs: Current version: 1.0.0
 *
 * // Can be used in CLI version display
 * displayInfo(` create-zap-app v${await getPackageVersion()}\n`);
 * ```
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
 *
 * @example
 * ```typescript
 * import { displayWelcome } from './cli';
 *
 * // Display welcome banner when CLI starts
 * displayWelcome();
 * // Outputs:
 * //  🚀 Welcome to create-zap-app! Let's build something awesome.
 * ```
 */
export function displayWelcome(): void {
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
 *
 * @example
 * ```typescript
 * import { displayError } from './cli';
 *
 * try {
 *   // Some operation that might fail
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   displayError(error);
 *   // Outputs: ❌ An error occurred: Something went wrong
 * }
 *
 * // Can also handle non-Error objects
 * displayError('Custom error message');
 * // Outputs: ❌ An error occurred: Custom error message
 * ```
 */
export function displayError(error: unknown): void {
  process.stderr.write(
    chalk.bold.red('\n❌ An error occurred: ') +
      (error instanceof Error ? error.message : String(error))
  );
}

/**
 * Displays a success message to stdout with green formatting.
 * @param message - The success message to display.
 *
 * @example
 * ```typescript
 * import { displaySuccess } from './cli';
 *
 * // Display success message after operation completes
 * displaySuccess('✅ Project created successfully!\n');
 * // Outputs: ✅ Project created successfully! (in green)
 *
 * // Can be used for any success feedback
 * displaySuccess('🎉 All dependencies installed!\n');
 * ```
 */
export function displaySuccess(message: string): void {
  process.stdout.write(chalk.green(message));
}

/**
 * Displays an informational message to stdout with cyan formatting.
 * @param message - The informational message to display.
 *
 * @example
 * ```typescript
 * import { displayInfo } from './cli';
 *
 * // Display informational message during setup
 * displayInfo('📦 Installing dependencies...\n');
 * // Outputs: 📦 Installing dependencies... (in cyan)
 *
 * // Can be used for progress updates
 * displayInfo('🔧 Configuring project settings...\n');
 * ```
 */
export function displayInfo(message: string): void {
  process.stdout.write(chalk.cyan(message));
}

/**
 * Displays a warning message to stdout with yellow formatting.
 * @param message - The warning message to display.
 *
 * @example
 * ```typescript
 * import { displayWarning } from './cli';
 *
 * // Display warning about deprecated features
 * displayWarning('⚠️  This feature will be deprecated in the next version\n');
 * // Outputs: ⚠️  This feature will be deprecated in the next version (in yellow)
 *
 * // Can be used for configuration warnings
 * displayWarning('🔧 Using default configuration values\n');
 * ```
 */
export function displayWarning(message: string): void {
  process.stdout.write(chalk.yellow(message));
}
