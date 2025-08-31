import { allFileLists } from '@/files';
import type { FileEntry, PluginId } from '@/types';

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
