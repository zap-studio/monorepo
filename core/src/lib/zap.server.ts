import { toClient } from "@/zap/plugins/utils";

// Add/remove plugins here
export const zapServerClient = toClient([]);

export type ZapServerClient = typeof zapServerClient;

export function getServerPlugin<TPlugin extends keyof ZapServerClient>(
  pluginId: TPlugin
): ZapServerClient[TPlugin] {
  return zapServerClient[pluginId];
}
