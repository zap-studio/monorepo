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
export const getFilesForPlugin = (pluginId: PluginId): FileEntry[] => {
  const result: FileEntry[] = [];
  for (const fileList of allFileLists) {
    for (const entry of fileList.entries) {
      if (Array.isArray(entry.plugins) && entry.plugins.includes(pluginId)) {
        result.push(entry);
      }
    }
  }
  return result;
};

/**
 * Returns all core plugins.
 */
export const getCorePlugins = (): CorePluginId[] => {
  return Object.values(corePlugins).map((plugin) => plugin.id as CorePluginId);
};

/**
 * Returns all optional plugins.
 */
export const getOptionalPlugins = (): OptionalPluginId[] => {
  return Object.values(optionalPlugins).map(
    (plugin) => plugin.id as OptionalPluginId
  );
};
