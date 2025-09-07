import type { ZapServerPlugin, ZapServerPlugins } from "@/zap/plugins/types";
import { mergePluginsToObject } from "@/zap/plugins/utils";

// Plugin array - add/remove plugins here
export const zapServerClientArray: ZapServerPlugin[] = [];

/**
 * Merged server plugins object
 */
export const zapServerClient: ZapServerPlugins =
  mergePluginsToObject(zapServerClientArray);

/**
 * Get a server plugin by its ID
 * @param id Plugin ID
 * @returns The server plugin or undefined if not found
 */
export function getServerPlugin(id: string) {
  return zapServerClient[id];
}
