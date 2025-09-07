import type { BaseZapPlugin } from "../types";

export function zap<T extends BaseZapPlugin>(plugins: T[]): Record<string, T> {
  return Object.fromEntries(plugins.map((plugin) => [plugin.id, plugin]));
}

export function getPlugin<T extends BaseZapPlugin>(
  plugins: Record<string, T>,
  id: string
): T | undefined {
  return plugins[id];
}

export function getPluginConfig<TConfig, T extends { config?: TConfig }>(
  plugins: Record<string, T>,
  id: string,
  fallback: TConfig
): TConfig {
  return plugins[id]?.config ?? fallback;
}
