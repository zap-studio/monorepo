import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";

export function authPlugin(
  config?: Partial<AuthServerPluginConfig>
): ZapServerPlugin<"auth", AuthServerPluginConfig> {
  return {
    id: "auth",
    config,
  } satisfies ZapServerPlugin<"auth">;
}
