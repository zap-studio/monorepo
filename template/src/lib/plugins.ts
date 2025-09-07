import { PLUGIN_CONFIG } from "@/zap.config";
import type { ZapPlugins } from "@/zap.config.types";

/**
 * Check if a specific plugin is enabled
 * @param plugin - The plugin name to check
 * @returns boolean - true if the plugin is enabled, false otherwise
 */
export function isPluginEnabled(plugin: ZapPlugins): boolean {
  return PLUGIN_CONFIG[plugin] ?? false;
}

/**
 * Get all enabled plugins
 * @returns Array of enabled plugin names
 */
export function getEnabledPlugins(): ZapPlugins[] {
  return (Object.keys(PLUGIN_CONFIG) as ZapPlugins[]).filter(
    (plugin) => PLUGIN_CONFIG[plugin]
  );
}

/**
 * Get all disabled plugins
 * @returns Array of disabled plugin names
 */
export function getDisabledPlugins(): ZapPlugins[] {
  return (Object.keys(PLUGIN_CONFIG) as ZapPlugins[]).filter(
    (plugin) => !PLUGIN_CONFIG[plugin]
  );
}

/**
 * Get the total count of enabled plugins
 * @returns Number of enabled plugins
 */
export function getEnabledPluginCount(): number {
  return getEnabledPlugins().length;
}

/**
 * Get the total count of disabled plugins
 * @returns Number of disabled plugins
 */
export function getDisabledPluginCount(): number {
  return getDisabledPlugins().length;
}

/**
 * Check if multiple plugins are enabled
 * @param plugins - Array of plugin names to check
 * @returns boolean - true if all plugins are enabled, false otherwise
 */
export function arePluginsEnabled(plugins: ZapPlugins[]): boolean {
  return plugins.every((plugin) => isPluginEnabled(plugin));
}

/**
 * Check if any of the specified plugins are enabled
 * @param plugins - Array of plugin names to check
 * @returns boolean - true if at least one plugin is enabled, false otherwise
 */
export function isAnyPluginEnabled(plugins: ZapPlugins[]): boolean {
  return plugins.some((plugin) => isPluginEnabled(plugin));
}
