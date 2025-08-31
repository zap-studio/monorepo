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
import { PACKAGE_MANAGERS } from '@/data/package-manager';
import { PackageManager } from '@/types/package-manager';

export async function createProject({ projectName, directory, packageManager }: { projectName?: string; directory?: string; packageManager?: string } = {}): Promise<void> {
  let finalProjectName = projectName;
  if (!finalProjectName) {
    finalProjectName = await promptProjectName();
  }

  let finalPackageManager: PackageManager;
  if (packageManager && PACKAGE_MANAGERS.includes(packageManager as any)) {
    finalPackageManager = packageManager as PackageManager;
  } else {
    finalPackageManager = await promptPackageManagerSelection(
      'Which package manager do you want to use?'
    );
  }

  let outputDir: string;
  try {
    outputDir = directory ? path.resolve(directory, finalProjectName) : path.join(process.cwd(), finalProjectName);
  } catch (err) {
    process.stderr.write(`Unable to resolve output directory path.\n`);
    process.exit(1);
  }

  const spinner = ora(`Creating project '${finalProjectName}'...`).start();
  try {
    await fs.ensureDir(outputDir);
  } catch (error) {
    throw new FileSystemError(`Failed to create project directory: ${error}`);
  }

  await setupProjectTemplate(outputDir, spinner);

  const resolvedPackageManager = await installDependenciesWithRetry(
    finalPackageManager,
    outputDir,
    spinner
  );
  finalPackageManager = resolvedPackageManager;

  await updateDependencies(finalPackageManager, outputDir, spinner);
  await runFormatting(finalPackageManager, outputDir, spinner);
  await generateEnvFile(outputDir, spinner);

  displaySuccessMessage(finalProjectName, finalPackageManager);
}
