import path from 'node:path';
import { optionalPlugins } from '@zap-ts/architecture/plugins';
import type { PluginId } from '@zap-ts/architecture/types';
import type { Ora } from 'ora';
import { readPackageJson, removeDependency } from '@/utils/misc/package-json';

export async function pruneUnusedPluginsAndDependencies(
  outputDir: string,
  selectedPlugins: PluginId[],
  spinner: Ora
): Promise<void> {
  await pruneDependenciesForSelectedPlugins(
    outputDir,
    selectedPlugins,
    spinner
  );
  await removeUnusedPluginFiles(outputDir, selectedPlugins, spinner);
}

export async function pruneDependenciesForSelectedPlugins(
  outputDir: string,
  selectedPlugins: PluginId[],
  spinner: Ora
): Promise<void> {
  const unusedPlugins: PluginId[] = Object.values(optionalPlugins)
    .filter((plugin) => !selectedPlugins.includes(plugin.id))
    .map((plugin) => plugin.id);

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

  const packageJson = await readPackageJson(
    path.join(outputDir, 'package.json')
  );
  await Promise.allSettled(
    allDeps.map(([dep, isDev]) => removeDependency(packageJson, dep, isDev))
  );
}

export async function removeUnusedPluginFiles(
  _outputDir: string,
  _selectedPlugins: PluginId[],
  _spinner: Ora
): Promise<void> {
  // Implementation for removing unused plugin files
}
