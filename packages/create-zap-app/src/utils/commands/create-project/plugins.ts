import path from 'node:path';
import { optionalPlugins } from '@zap-ts/architecture/plugins';
import type { PluginId } from '@zap-ts/architecture/types';
import { getFilesForPlugins } from '@zap-ts/architecture/utils/plugins';
import fs from 'fs-extra';
import type { Ora } from 'ora';
import { getErrorMessage } from '@/utils/misc/error';
import { readPackageJson, removeDependencies } from '@/utils/misc/package-json';

export async function pruneUnusedPluginsAndDependencies(
  outputDir: string,
  selectedPlugins: PluginId[],
  spinner: Ora
): Promise<void> {
  const unusedPlugins: PluginId[] = Object.values(optionalPlugins)
    .filter((plugin) => !selectedPlugins.includes(plugin.id))
    .map((plugin) => plugin.id);

  await pruneDependenciesForSelectedPlugins(outputDir, unusedPlugins, spinner);
  await removeUnusedPluginFiles(outputDir, unusedPlugins, spinner);
}

export async function pruneDependenciesForSelectedPlugins(
  outputDir: string,
  unusedPlugins: PluginId[],
  spinner: Ora
): Promise<void> {
  const depsToRemove = new Set<string>();
  const devDepsToRemove = new Set<string>();

  for (const plugin of unusedPlugins) {
    const pluginConfig = Object.values(optionalPlugins).find(
      (p) => p.id === plugin
    );

    if (!pluginConfig) {
      continue;
    }

    for (const dep of pluginConfig.dependencies || []) {
      depsToRemove.add(dep);
    }

    for (const devDep of pluginConfig.devDependencies || []) {
      devDepsToRemove.add(devDep);
    }
  }

  await removeDependenciesFromPackageJson(
    outputDir,
    depsToRemove,
    devDepsToRemove,
    spinner
  );
}

export async function removeDependenciesFromPackageJson(
  outputDir: string,
  depsToRemove: Set<string>,
  devDepsToRemove: Set<string>,
  spinner: Ora
): Promise<void> {
  const allDeps = [
    ...[...depsToRemove].map((dep) => [dep, false] as const),
    ...[...devDepsToRemove].map((dep) => [dep, true] as const),
  ];

  if (allDeps.length === 0) {
    return;
  }

  spinner.info(
    `Removing dependencies: ${allDeps.map(([dep]) => dep).join(', ')}`
  );

  try {
    const packageJsonPath = path.join(outputDir, 'package.json');
    const packageJson = await readPackageJson(packageJsonPath);
    await removeDependencies({
      pkg: packageJson,
      path: packageJsonPath,
      deps: Object.fromEntries([...depsToRemove].map((dep) => [dep, ''])),
      dev: false,
    });
  } catch (error) {
    spinner.fail(
      `Failed to delete unused dependencies: ${getErrorMessage(error)}`
    );
    return;
  }
}

export async function removeUnusedPluginFiles(
  _outputDir: string,
  unusedPlugins: PluginId[],
  spinner: Ora
): Promise<void> {
  try {
    const pluginFiles = getFilesForPlugins(unusedPlugins);

    spinner.info(
      `Removing unused plugin files: ${pluginFiles.map((f) => f.path).join(', ')}`
    );
    await Promise.allSettled(
      pluginFiles.map(async (file) => {
        if (await fs.pathExists(file.path)) {
          await fs.remove(file.path);
        }
      })
    );

    // handle zap/ directory
    const zapDir = path.join(_outputDir, 'zap');
    if (await fs.pathExists(zapDir)) {
      await fs.remove(zapDir);
    }
  } catch (error) {
    spinner.fail(
      `Failed to remove unused plugin files: ${getErrorMessage(error)}`
    );
  }
}
