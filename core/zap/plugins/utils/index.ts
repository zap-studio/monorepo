import type { BaseZapPlugin } from "../types";

export function mergePluginsToObject<T extends BaseZapPlugin>(
  plugins: T[]
): Record<string, T> {
  return Object.fromEntries(plugins.map((plugin) => [plugin.id, plugin]));
}

export function getPlugin<T extends BaseZapPlugin>(
  plugins: Record<string, T>,
  id: string
): T | undefined {
  return plugins[id];
}

export function getPluginConfig<T>(
  plugins: Record<string, { config: T }>,
  id: string,
  fallback: T
): T {
  return plugins[id]?.config ?? fallback;
}
