import { plugins } from "@zap-ts/architecture/plugins";
import type { PluginId } from "@zap-ts/architecture/types";
import { classifyPlugin } from "./plugin-utils";

export type PluginImportMap = Record<PluginId, Set<PluginId>>;

export async function buildPluginImportMap(
  pluginEntries: Array<{ plugin: PluginId; path: string }>
): Promise<PluginImportMap> {
  const map: PluginImportMap = Object.keys(plugins).reduce((acc, id) => {
    acc[id as PluginId] = new Set();
    return acc;
  }, {} as PluginImportMap);
  for (const { plugin, path: _path } of pluginEntries) {
    map[plugin] ??= new Set();
    const { findZapImports } = await import("./plugin-utils");
    const imports = await findZapImports(_path);
    for (const { plugin: importedPlugin } of imports) {
      if (importedPlugin !== plugin) {
        map[plugin].add(importedPlugin);
      }
    }
  }
  return map;
}

export function summarizeCorePluginDependencies(
  corePlugins: Array<{ plugin: PluginId; path: string }>,
  importMap: PluginImportMap
): Record<PluginId, PluginId[]> {
  const summary: Record<PluginId, PluginId[]> = Object.keys(plugins).reduce(
    (acc, id) => {
      acc[id as PluginId] = [];
      return acc;
    },
    {} as Record<PluginId, PluginId[]>
  );
  for (const { plugin } of corePlugins) {
    summary[plugin] = Array.from(importMap[plugin] ?? []).filter(
      (p) => classifyPlugin(p) === "optional"
    );
  }
  return summary;
}

export function summarizeOptionalPluginDependencies(
  optionalPlugins: Array<{ plugin: PluginId; path: string }>,
  importMap: PluginImportMap
): Record<PluginId, PluginId[]> {
  const summary: Record<PluginId, PluginId[]> = Object.keys(plugins).reduce(
    (acc, id) => {
      acc[id as PluginId] = [];
      return acc;
    },
    {} as Record<PluginId, PluginId[]>
  );
  for (const { plugin } of optionalPlugins) {
    summary[plugin] = Array.from(importMap[plugin] ?? []).filter(
      (p) => classifyPlugin(p) === "optional" && p !== plugin
    );
  }
  return summary;
}
