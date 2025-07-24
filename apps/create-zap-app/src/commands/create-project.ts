import { Effect } from 'effect';
import ora from 'ora';
import { ensureDirEffect, joinPathEffect } from '@/utils';
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
import { setupProjectTemplate } from '@/utils/commands/project/setup';

export function createProjectEffect() {
  return Effect.gen(function* () {
    const projectName = yield* promptProjectName();
    let packageManager = yield* promptPackageManagerSelection(
      'Which package manager do you want to use?'
    );

    const outputDir = yield* joinPathEffect(process.cwd(), projectName);
    const spinner = ora(`Creating project '${projectName}'...`).start();

    yield* ensureDirEffect(outputDir);
    yield* setupProjectTemplate(outputDir, spinner);

    const finalPackageManager = yield* installDependenciesWithRetry(
      packageManager,
      outputDir,
      spinner
    );
    packageManager = finalPackageManager;

    yield* updateDependencies(packageManager, outputDir, spinner);
    yield* runPrettierFormatting(packageManager, outputDir, spinner);
    yield* generateEnvFile(outputDir, spinner);

    displaySuccessMessage(projectName, packageManager);
  });
}
