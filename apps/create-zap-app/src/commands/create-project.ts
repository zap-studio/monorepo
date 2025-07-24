import path from 'node:path';
import { Effect } from 'effect';
import ora from 'ora';
import {
  installDependenciesWithRetry,
  updateDependencies,
} from '@/utils/commands/project/dependencies';
import {
  displaySuccessMessage,
  generateEnvFile,
  runPrettierFormatting,
} from '@/utils/commands/project/post-install';
import {
  promptPackageManagerSelection,
  promptProjectName,
} from '@/utils/commands/project/prompts';
import {
  createProjectDirectory,
  setupProjectTemplate,
} from '@/utils/commands/project/setup';

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
