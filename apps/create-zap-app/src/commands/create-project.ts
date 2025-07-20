import path from 'node:path';
import { Effect } from 'effect';
import ora from 'ora';
import {
  createProjectDirectory,
  displaySuccessMessage,
  generateEnvFile,
  installDependenciesWithRetry,
  promptPackageManagerSelection,
  promptProjectName,
  runPrettierFormatting,
  setupProjectTemplate,
  updateDependencies,
} from '@/utils/commands/project';

/**
 * Main effect for creating a new Zap.ts project.
 * Handles the entire project creation workflow including prompts,
 * template setup, dependency installation, and final setup.
 *
 * @example
 * ```typescript
 * import { Effect } from 'effect';
 * import { createProjectEffect } from './create-project';
 *
 * // Run the project creation effect
 * const program = Effect.runPromise(createProjectEffect());
 *
 * // Or handle errors explicitly
 * const programWithErrorHandling = Effect.runPromise(
 *   Effect.catchAll(createProjectEffect(), (error) => {
 *     console.error('Failed to create project:', error);
 *     return Effect.fail(error);
 *   })
 * );
 * ```
 *
 * @returns Effect that resolves when project creation is complete
 */
export function createProjectEffect(): Effect.Effect<void, Error, never> {
  return Effect.gen(function* (_) {
    const projectName = yield* _(promptProjectName());
    let packageManager = yield* _(promptPackageManagerSelection());

    const outputDir = path.join(process.cwd(), projectName);
    const spinner = ora(`Creating project '${projectName}'...`).start();

    yield* _(createProjectDirectory(outputDir, spinner));

    yield* _(setupProjectTemplate(outputDir, spinner));

    const finalPackageManager = yield* _(
      installDependenciesWithRetry(packageManager, outputDir, spinner)
    );
    packageManager = finalPackageManager;

    yield* _(updateDependencies(packageManager, outputDir, spinner));
    yield* _(runPrettierFormatting(packageManager, outputDir, spinner));
    yield* _(generateEnvFile(outputDir, spinner));

    displaySuccessMessage(projectName, packageManager);
  });
}
