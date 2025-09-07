import { plugins } from "@zap-ts/architecture/plugins";
import type { PluginId } from "@zap-ts/architecture/types";
import { findZapImports } from "./plugin-utils";

export type PluginImportMap = Record<PluginId, Set<PluginId>>;

function initializeImportMap(): PluginImportMap {
  return Object.keys(plugins).reduce((acc, id) => {
    acc[id as PluginId] = new Set<PluginId>();
    return acc;
  }, {} as PluginImportMap);
}

function initializeResultMap(): Record<PluginId, PluginId[]> {
  return Object.keys(plugins).reduce(
    (acc, id) => {
      acc[id as PluginId] = [];
      return acc;
    },
    {} as Record<PluginId, PluginId[]>
  );
}

export async function summarizePluginDependencies(
  step: {
    plugin: PluginId;
    path: string;
  }[]
): Promise<Record<PluginId, PluginId[]>> {
  const summary = initializeImportMap();
  const pluginIds = new Set<PluginId>(step.map((p) => p.plugin));

  for (const pluginId of pluginIds) {
    const pluginPaths = step
      .filter((p) => p.plugin === pluginId)
      .map((p) => p.path);

    for (const path of pluginPaths) {
      const matches = await findZapImports(path);

      for (const match of matches) {
        if (match.plugin !== pluginId && match.plugin in summary) {
          summary[pluginId].add(match.plugin);
        }
      }
    }
  }

  const result = initializeResultMap();
  for (const [key, value] of Object.entries(summary)) {
    result[key as PluginId] = Array.from(value);
  }

  return result;
}
