import { allFileLists } from "@/files";
import { corePlugins, optionalPlugins } from "@/plugins";
import type {
  CorePluginId,
  FileEntry,
  OptionalPluginId,
  Plugin,
  PluginId,
} from "@/types";

/**
 * Returns all file entries from all FileLists that use the specified plugin.
 * @param pluginId The plugin id to filter by.
 */
export function getFilesForPlugin(pluginId: PluginId): FileEntry[] {
  const result: FileEntry[] = [];
  for (const fileList of allFileLists) {
    for (const entry of fileList.entries) {
      if (Array.isArray(entry.plugins) && entry.plugins.includes(pluginId)) {
        result.push(entry);
      }
    }
  }
  return result;
}

/**
 * Returns all file entries from all FileLists that use the specified plugins.
 * @param pluginIds The plugin ids to filter by.
 * @returns An array of file entries that use the specified plugins.
 */
export function getFilesForPlugins(pluginIds: PluginId[]): FileEntry[] {
  return pluginIds.flatMap(getFilesForPlugin);
}

/**
 * Returns all core plugins.
 */
export function getCorePlugins(): CorePluginId[] {
  return Object.values(corePlugins).map((plugin) => plugin.id as CorePluginId);
}

/**
 * Returns all optional plugins.
 */
export function getOptionalPlugins(): OptionalPluginId[] {
  return Object.values(optionalPlugins).map(
    (plugin) => plugin.id as OptionalPluginId
  );
}

/**
 * Returns required core plugins for a given plugin.
 * @param plugin The plugin to get the core required plugins for.
 * @returns An array of core plugin ids that are required by the given plugin.
 */
export function getCoreRequiredPlugins(plugin: Plugin): CorePluginId[] {
  return plugin.coreRequiredPlugins || [];
}

/**
 * Returns required optional plugins for a given plugin.
 * @param plugin The plugin to get the optional required plugins for.
 * @returns An array of optional plugin ids that are required by the given plugin.
 */
export function getOptionalRequiredPlugins(plugin: Plugin): OptionalPluginId[] {
  return plugin.requiredPlugins || [];
}

/**
 * Returns all required plugins for a given plugin.
 * This includes both core required plugins and optional required plugins.
 * @param plugin The plugin to get the required plugins for.
 * @returns An array of plugin ids that are required by the given plugin.
 */
export function getRequiredPlugins(plugin: Plugin): PluginId[] {
  const coreRequired = plugin.coreRequiredPlugins || [];
  const optionalRequired = plugin.requiredPlugins || [];
  return [...coreRequired, ...optionalRequired];
}
