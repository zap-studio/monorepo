import type { IDE, OptionalPluginId } from "@zap-ts/architecture/types";
import fs from "fs-extra";
import ora from "ora";
import { FileSystemError } from "@/lib/errors.js";
import type { PackageManager } from "@/types/package-manager";
import {
  installDependenciesWithRetry,
  updateDependencies,
} from "@/utils/commands/create-project/dependencies.js";
import { ensureDirectoryIsReady } from "@/utils/commands/create-project/guard";
import { pruneUnusedPluginsAndDependencies } from "@/utils/commands/create-project/plugins";
import {
  displaySuccessMessage,
  generateEnvFile,
  runFormatting,
} from "@/utils/commands/create-project/post-install.js";
import {
  resolveIDE,
  resolveOutputDir,
  resolvePackageManager,
  resolvePlugins,
  resolveProjectName,
} from "@/utils/commands/create-project/resolve-options";
import { getErrorMessage } from "@/utils/misc/error";
import { setupTemplate } from "@/utils/template/setup-template";

type CreateProjectOptions = {
  projectName?: string;
  directory?: string;
  packageManager?: PackageManager;
  ide?: IDE;
  plugins?: OptionalPluginId[];
  verbose?: boolean;
};

export async function createProject(
  options: CreateProjectOptions = {}
): Promise<void> {
  const projectName = await resolveProjectName(options.projectName);
  let packageManager = await resolvePackageManager(options.packageManager);
  const outputDir = resolveOutputDir(projectName, options.directory);
  const ide = await resolveIDE(options.ide);
  const selectedPlugins = await resolvePlugins(options.plugins);
  const verbose = !!options.verbose;

  await ensureDirectoryIsReady({ outputDir, projectName });

  const spinner = ora(`Creating project '${projectName}'...`).start();

  await fs.ensureDir(outputDir).catch((error) => {
    throw new FileSystemError(
      `Failed to create project directory: ${getErrorMessage(error)}`
    );
  });

  spinner.text = "Downloading Zap.ts template from GitHub...";
  await setupTemplate({ outputDir, ide }, spinner, verbose);
  await pruneUnusedPluginsAndDependencies(
    { outputDir, selectedPlugins },
    spinner,
    verbose
  );
  packageManager = await installDependenciesWithRetry(
    {
      outputDir,
      initialPM: packageManager,
    },
    spinner
  );
  await updateDependencies({ outputDir, packageManager }, spinner, verbose);
  await runFormatting({ outputDir, packageManager }, spinner, verbose);
  await generateEnvFile({ outputDir }, spinner, verbose);

  displaySuccessMessage({ projectName, packageManager });
}
