import path from 'node:path';
import fs from 'fs-extra';
import ora from 'ora';
import { FileSystemError } from '@/lib/errors';
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

export async function createProject() {
  const projectName = await promptProjectName();
  let packageManager = await promptPackageManagerSelection(
    'Which package manager do you want to use?'
  );

  const outputDir = path.join(process.cwd(), projectName);
  const spinner = ora(`Creating project '${projectName}'...`).start();

  try {
    await fs.ensureDir(outputDir);
  } catch (error) {
    throw new FileSystemError(`Failed to create project directory: ${error}`);
  }

  await setupProjectTemplate(outputDir, spinner);

  const finalPackageManager = await installDependenciesWithRetry(
    packageManager,
    outputDir,
    spinner
  );
  packageManager = finalPackageManager;

  await updateDependencies(packageManager, outputDir, spinner);
  await runPrettierFormatting(packageManager, outputDir, spinner);
  await generateEnvFile(outputDir, spinner);

  displaySuccessMessage(projectName, packageManager);
}
