import { Effect } from 'effect';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import { setupTemplate } from '@/utils/index.js';

/**
 * Creates the project directory and handles any errors.
 * @param outputDir - The directory path to create
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves when directory is created
 *
 * @example
 * ```typescript
 * import { createProjectDirectory } from '@/utils/commands/project/setup.js';
 *
 * createProjectDirectory('/path/to/project', spinner);
 * ```
 */
export function createProjectDirectory(
  outputDir: string,
  spinner: Ora
): Effect.Effect<void, Error, never> {
  return Effect.tryPromise({
    try: () => fs.ensureDir(outputDir),
    catch: () => {
      spinner.fail(
        'Failed to create project directory. Please check your permissions and try again.'
      );
      process.exit(1);
    },
  });
}

/**
 * Downloads and sets up the project template.
 * @param outputDir - The directory where the template should be set up
 * @param spinner - The ora spinner instance for user feedback
 * @returns Effect that resolves when template is set up
 *
 * @example
 * ```typescript
 * import { setupProjectTemplate } from '@/utils/commands/project/setup.js';
 *
 * setupProjectTemplate('/path/to/project', spinner);
 * ```
 */
export function setupProjectTemplate(
  outputDir: string,
  spinner: Ora
): Effect.Effect<void, Error, never> {
  spinner.text = 'Downloading Zap.ts template from GitHub...';
  return Effect.tryPromise({
    try: () => setupTemplate(outputDir, spinner),
    catch: () => {
      spinner.fail(
        'Failed to download or extract template. Please check your internet connection and try again.'
      );
      process.exit(1);
    },
  });
}
