import type { IDE, PluginId } from '@zap-ts/architecture/types';
import fs from 'fs-extra';
import ora from 'ora';

import { FileSystemError } from '@/lib/errors.js';
import type { PackageManager } from '@/types/package-manager';

import {
  installDependenciesWithRetry,
  updateDependencies,
} from '@/utils/commands/create-project/dependencies.js';
import {
  displaySuccessMessage,
  generateEnvFile,
  runFormatting,
} from '@/utils/commands/create-project/post-install.js';
import {
  resolveIDE,
  resolveOutputDir,
  resolvePackageManager,
  resolvePlugins,
  resolveProjectName,
} from '@/utils/commands/create-project/resolve-options';
import { setupTemplate } from '@/utils/template/setup-template';

type CreateProjectOptions = {
  projectName?: string;
  directory?: string;
  packageManager?: PackageManager;
  ide?: IDE;
  plugins?: PluginId[];
};

export async function createProject(
  options: CreateProjectOptions = {}
): Promise<void> {
  const projectName = await resolveProjectName(options.projectName);
  let packageManager = await resolvePackageManager(options.packageManager);
  const outputDir = resolveOutputDir(projectName, options.directory);
  const ide = await resolveIDE(options.ide);
  const _plugins = await resolvePlugins(options.plugins);

  const spinner = ora(`Creating project '${projectName}'...`).start();

  try {
    await fs.ensureDir(outputDir);
  } catch (error) {
    throw new FileSystemError(`Failed to create project directory: ${error}`);
  }

  spinner.text = 'Downloading Zap.ts template from GitHub...';
  await setupTemplate(outputDir, ide, spinner);

  packageManager = await installDependenciesWithRetry(
    packageManager,
    outputDir,
    spinner
  );
  await updateDependencies(packageManager, outputDir, spinner);
  await runFormatting(packageManager, outputDir, spinner);
  await generateEnvFile(outputDir, spinner);

  displaySuccessMessage(projectName, packageManager);
}
