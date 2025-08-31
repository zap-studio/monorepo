import { allFileLists } from '@/files';
import { corePlugins, optionalPlugins } from '@/plugins';
import type {
  CorePluginId,
  FileEntry,
  OptionalPluginId,
  PluginId,
} from '@/types';

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
