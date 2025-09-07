import { plugins } from "@zap-ts/architecture/plugins";
import type { PluginId } from "@zap-ts/architecture/types";

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

const BACKSLASH_REGEX = /\\/g;
const LEADING_SLASH_REGEX = /^\/+/;

export function summarizePluginDependencies(
  step: {
    plugin: PluginId;
    path: string;
  }[]
): Record<PluginId, PluginId[]> {
  const summary = initializeImportMap();
  const pluginIds = new Set<PluginId>(step.map((p) => p.plugin));

  for (const pluginId of pluginIds) {
    const pluginPaths = step
      .filter((p) => p.plugin === pluginId)
      .map((p) => p.path);

    for (const path of pluginPaths) {
      const normalizedPath = path
        .replace(BACKSLASH_REGEX, "/")
        .replace(LEADING_SLASH_REGEX, "");
      const segments = normalizedPath.split("/");
      const zapIndex = segments.indexOf("zap");
      const importedPluginId =
        zapIndex !== -1 ? segments.at(zapIndex + 1) : undefined;

      if (
        importedPluginId &&
        importedPluginId !== pluginId &&
        importedPluginId in summary
      ) {
        summary[pluginId].add(importedPluginId as PluginId);
      }
    }
  }

  const result = initializeResultMap();
  for (const [key, value] of Object.entries(summary)) {
    result[key as PluginId] = Array.from(value);
  }

  return result;
}
