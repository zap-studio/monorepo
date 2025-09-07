import path from "node:path";
import { optionalPlugins, plugins } from "@zap-ts/architecture/plugins";
import type { PluginId } from "@zap-ts/architecture/types";
import {
  getFilesForPlugins,
  getRequiredPlugins,
} from "@zap-ts/architecture/utils/plugins";
import fs from "fs-extra";
import type { Ora } from "ora";
import { getErrorMessage } from "@/utils/misc/error";
import { removeDependencies, removeScripts } from "@/utils/misc/package-json";

function getAllRequiredPlugins(selected: PluginId[]): Set<PluginId> {
  const visited = new Set<PluginId>();

  function visit(pluginId: PluginId) {
    if (visited.has(pluginId)) {
      return;
    }
    visited.add(pluginId);

    const plugin = plugins[pluginId];
    const required = getRequiredPlugins(plugin);

    for (const req of required) {
      visit(req);
    }
  }

  for (const id of selected) {
    visit(id);
  }

  return visited;
}

export async function pruneUnusedPluginsAndDependencies(
  params: {
    outputDir: string;
    selectedPlugins: PluginId[];
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  const requiredPlugins = getAllRequiredPlugins(params.selectedPlugins);
  const unusedPlugins: PluginId[] = Object.values(optionalPlugins)
    .filter(
      (plugin) =>
        !(
          params.selectedPlugins.includes(plugin.id) ||
          requiredPlugins.has(plugin.id)
        )
    )
    .map((plugin) => plugin.id);

  await pruneDependenciesForSelectedPlugins(
    {
      outputDir: params.outputDir,
      unusedPlugins,
    },
    spinner,
    verbose
  );
  await removeUnusedPluginFiles(
    {
      outputDir: params.outputDir,
      unusedPlugins,
    },
    spinner,
    verbose
  );
}

export async function pruneDependenciesForSelectedPlugins(
  params: {
    outputDir: string;
    unusedPlugins: PluginId[];
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  const depsToRemove = new Set<string>();
  const devDepsToRemove = new Set<string>();

  for (const plugin of params.unusedPlugins) {
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
    {
      outputDir: params.outputDir,
      depsToRemove,
      devDepsToRemove,
    },
    spinner,
    verbose
  );
  await removeUnusedScriptsFromPackageJson(
    {
      outputDir: params.outputDir,
      unusedPlugins: params.unusedPlugins,
    },
    spinner,
    verbose
  );
}

export async function removeDependenciesFromPackageJson(
  params: {
    outputDir: string;
    depsToRemove: Set<string>;
    devDepsToRemove: Set<string>;
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  const allDeps = [
    ...[...params.depsToRemove].map((dep) => [dep, false] as const),
    ...[...params.devDepsToRemove].map((dep) => [dep, true] as const),
  ];

  if (allDeps.length === 0) {
    return;
  }

  if (verbose) {
    const sortedDeps = [...params.depsToRemove].sort();
    const sortedDevDeps = [...params.devDepsToRemove].sort();

    spinner.info("Removing dependencies:");
    for (const dep of sortedDeps) {
      const msg = `- ${dep}`;
      process.stdout.write(`${msg}\n`);
    }
    for (const devDep of sortedDevDeps) {
      const msg = `- ${devDep} (devDependency)`;
      process.stdout.write(`${msg}\n`);
    }
  }

  try {
    const packageJsonPath = path.join(params.outputDir, "package.json");
    await removeDependencies({
      path: packageJsonPath,
      deps: Object.fromEntries(
        [...params.depsToRemove].map((dep) => [dep, ""])
      ),
      dev: false,
    });
  } catch (error) {
    spinner.fail("Failed to delete unused dependencies.");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}

export async function removeUnusedScriptsFromPackageJson(
  params: {
    outputDir: string;
    unusedPlugins: PluginId[];
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    const packageJsonPath = path.join(params.outputDir, "package.json");

    const scriptsToRemove = new Set<string>();

    for (const plugin of params.unusedPlugins) {
      const pluginConfig = Object.values(optionalPlugins).find(
        (p) => p.id === plugin
      );

      if (!pluginConfig) {
        continue;
      }

      for (const dep of pluginConfig.packageJsonScripts || []) {
        scriptsToRemove.add(dep);
      }
    }

    await removeScripts({
      path: packageJsonPath,
      keys: [...scriptsToRemove],
    });
  } catch (error) {
    spinner.fail("Failed to delete unused scripts.");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}

export async function removeUnusedPluginFiles(
  params: {
    outputDir: string;
    unusedPlugins: PluginId[];
  },
  spinner: Ora,
  verbose: boolean
): Promise<void> {
  try {
    const pluginFiles = getFilesForPlugins(params.unusedPlugins);

    if (verbose) {
      spinner.info("Removing unused plugin files:");

      const seen = new Set<string>();
      for (const file of [...pluginFiles].sort((a, b) =>
        a.path.localeCompare(b.path)
      )) {
        if (!seen.has(file.path)) {
          seen.add(file.path);
          const msg = `- ${file.path}`;
          process.stdout.write(`${msg}\n`);
        }
      }
    }

    // remove plugin files
    await Promise.allSettled(
      pluginFiles.map(async (file) => {
        const absolutePath = path.join(params.outputDir, file.path);
        if (await fs.pathExists(absolutePath)) {
          await fs.remove(absolutePath);
        }
      })
    );

    // handle zap/ directory
    const zapDir = path.join(params.outputDir, "zap");
    for (const pluginId of params.unusedPlugins) {
      const pluginFolder = path.join(zapDir, pluginId);
      if (await fs.pathExists(pluginFolder)) {
        await fs.remove(pluginFolder);
      }
    }
  } catch (error) {
    spinner.fail("Failed to remove unused plugin files.");
    if (verbose) {
      process.stderr.write(`${getErrorMessage(error)}\n`);
    }
  }
}
