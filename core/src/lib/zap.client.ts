import type { ZapClientPlugin, ZapClientPlugins } from "@/zap/plugins/types";
import { mergePluginsToObject } from "@/zap/plugins/utils";

// Plugin array - add/remove plugins here
export const zapClientArray: ZapClientPlugin[] = [];

/**
 * Merged client plugins object
 */
export const zapClient: ZapClientPlugins = mergePluginsToObject(zapClientArray);

/**
 * Get a client plugin by its ID
 * @param id Plugin ID
 * @returns The client plugin or undefined if not found
 */
export function getClientPlugin(id: string) {
  return zapClient[id];
}
