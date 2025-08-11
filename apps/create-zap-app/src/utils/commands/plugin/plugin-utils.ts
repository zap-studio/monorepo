import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { PluginConfig } from '@/types/plugin';
import { exists } from '@/utils/template/files';

/**
 * Find and load a plugin configuration from plugin.json
 */
export async function findPluginConfig(
  projectDir: string,
  pluginName: string
): Promise<PluginConfig | null> {
  const pluginPath = path.join(projectDir, 'zap', pluginName, 'plugin.json');

  if (!(await exists(pluginPath))) {
    return null;
  }

  try {
    const configContent = await fs.readFile(pluginPath, 'utf8');
    return JSON.parse(configContent) as PluginConfig;
  } catch {
    return null;
  }
}

/**
 * Get all available plugins in the project
 */
export async function getAllPlugins(projectDir: string): Promise<string[]> {
  const zapDir = path.join(projectDir, 'zap');

  if (!(await exists(zapDir))) {
    return [];
  }

  const dirents = await fs.readdir(zapDir, { withFileTypes: true });
  const pluginNames = dirents
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const validPlugins = await Promise.all(
    pluginNames.map(async (name) => {
      const pluginJsonPath = path.join(zapDir, name, 'plugin.json');
      return (await exists(pluginJsonPath)) ? name : null;
    })
  );

  return validPlugins.filter((name): name is string => name !== null);
}

/**
 * Check if a plugin exists in the project
 */
export function pluginExists(projectDir: string, pluginName: string): boolean {
  return findPluginConfig(projectDir, pluginName) !== null;
}

/**
 * Get all plugins with their configurations
 */
export async function getAllPluginConfigs(
  projectDir: string
): Promise<Array<{ name: string; config: PluginConfig }>> {
  const plugins = await getAllPlugins(projectDir);

  const configs = await Promise.all(
    plugins.map(async (pluginName) => {
      const config = await findPluginConfig(projectDir, pluginName);
      return config ? { name: pluginName, config } : null;
    })
  );

  return configs.filter(
    (item): item is { name: string; config: PluginConfig } => item !== null
  );
}
