import path from 'node:path';
import { IDEs } from '@zap-ts/architecture/ide';
import { Plugins } from '@zap-ts/architecture/plugins';
import type { IDE, PluginId } from '@zap-ts/architecture/types';
import fs from 'fs-extra';
import ora from 'ora';
import { PACKAGE_MANAGERS } from '@/data/package-manager';
import { FileSystemError } from '@/lib/errors.js';
import type { PackageManager } from '@/types/package-manager';
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
  promptIDESelection,
  promptPackageManagerSelection,
  promptPluginSelection,
  promptProjectName,
} from '@/utils/commands/project/prompts.js';
import { setupTemplate } from '@/utils/template/setup-template';

type CreateProjectOptions = {
  projectName?: string;
  directory?: string;
  packageManager?: PackageManager;
  ide?: IDE;
  plugins?: PluginId[];
};

export async function createProject({
  projectName,
  directory,
  packageManager,
  ide,
  plugins,
}: CreateProjectOptions = {}): Promise<void> {
  let finalProjectName = projectName;
  if (!finalProjectName) {
    finalProjectName = await promptProjectName();
  }

  let finalPackageManager: PackageManager;
  if (packageManager && PACKAGE_MANAGERS.includes(packageManager)) {
    finalPackageManager = packageManager as PackageManager;
  } else {
    finalPackageManager = await promptPackageManagerSelection(
      'Which package manager do you want to use?'
    );
  }

  let outputDir: string;
  try {
    outputDir = directory
      ? path.resolve(directory, finalProjectName)
      : path.join(process.cwd(), finalProjectName);
  } catch {
    process.stderr.write('Unable to resolve output directory path.\n');
    process.exit(1);
  }

  let finalIDE: IDE | 'all' | null;
  if (
    ide &&
    Object.values(IDEs)
      .map((i) => i.id)
      .includes(ide)
  ) {
    finalIDE = ide as IDE;
  } else {
    finalIDE = await promptIDESelection('Which IDE do you want to use?');
  }

  if (!plugins || plugins.length === 0) {
    await promptPluginSelection('Which plugins do you want to use?');
  }

  const finalPlugins: PluginId[] = [];
  for (const plugin of Object.values(Plugins)) {
    if (plugins?.includes(plugin.id)) {
      finalPlugins.push(plugin.id);
    }
  }

  const spinner = ora(`Creating project '${finalProjectName}'...`).start();
  try {
    await fs.ensureDir(outputDir);
  } catch (error) {
    throw new FileSystemError(`Failed to create project directory: ${error}`);
  }

  spinner.text = 'Downloading Zap.ts template from GitHub...';
  await setupTemplate(outputDir, finalIDE, spinner);

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
