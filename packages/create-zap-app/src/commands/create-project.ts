import path from 'node:path';
import fs from 'fs-extra';
import ora from 'ora';
import { FileSystemError } from '@/lib/errors.js';
import {
  installDependenciesWithRetry,
  updateDependencies,
} from '@/utils/commands/project/dependencies.js';
import {
  displaySuccessMessage,
  generateEnvFile,
  runFormatting,
} from '@/utils/commands/project/post-install.js';
import {
  promptPackageManagerSelection,
  promptProjectName,
} from '@/utils/commands/project/prompts.js';
import { setupProjectTemplate } from '@/utils/commands/project/setup.js';

export async function createProject(): Promise<void> {
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
  await runFormatting(packageManager, outputDir, spinner);
  await generateEnvFile(outputDir, spinner);

  displaySuccessMessage(projectName, packageManager);
}
