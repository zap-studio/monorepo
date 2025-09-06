import path from "node:path";
import { IDEs } from "@zap-ts/architecture/ide";
import type {
  IDE,
  OptionalPluginId,
  PluginId,
} from "@zap-ts/architecture/types";
import {
  getCorePlugins,
  getOptionalPlugins,
} from "@zap-ts/architecture/utils/plugins";
import { PACKAGE_MANAGERS } from "@/data/package-manager";
import type { PackageManager } from "@/types/package-manager";
import {
  promptIDESelection,
  promptPackageManagerSelection,
  promptPluginSelection,
  promptProjectName,
} from "@/utils/commands/create-project/prompts.js";

export async function resolveProjectName(
  projectName?: string
): Promise<string> {
  return projectName ?? (await promptProjectName());
}

export async function resolvePackageManager(
  packageManager?: PackageManager
): Promise<PackageManager> {
  if (packageManager && PACKAGE_MANAGERS.includes(packageManager)) {
    return new Promise((resolve) => resolve(packageManager));
  }
  return await promptPackageManagerSelection(
    "Which package manager do you want to use?"
  );
}

export function resolveOutputDir(
  projectName: string,
  directory?: string
): string {
  try {
    return directory
      ? path.resolve(directory, projectName)
      : path.join(process.cwd(), projectName);
  } catch {
    process.stderr.write("Unable to resolve output directory path.\n");
    process.exit(1);
  }
}

export async function resolveIDE(ide?: IDE): Promise<IDE | "all" | null> {
  const validIdes = Object.values(IDEs).map((i) => i.id);
  if (ide && validIdes.includes(ide)) {
    return new Promise((resolve) => resolve(ide));
  }
  return await promptIDESelection("Which IDE do you want to use?");
}

export async function resolvePlugins(
  plugins?: OptionalPluginId[]
): Promise<PluginId[]> {
  const corePlugins = getCorePlugins();
  const optionalPlugins = getOptionalPlugins();

  const selected: OptionalPluginId[] = plugins?.length
    ? plugins.filter((p) => optionalPlugins.includes(p))
    : await promptPluginSelection("Which plugins do you want to use?");

  return Array.from(new Set([...corePlugins, ...selected]));
}
