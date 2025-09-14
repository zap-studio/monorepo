import type { ZapClientPlugin } from "@/zap/plugins/types";
import type { AuthClientPluginConfig } from "@/zap/plugins/types/auth.plugin";

export function authClientPlugin(
  config?: Partial<AuthClientPluginConfig>
): ZapClientPlugin<"auth"> {
  return {
    id: "auth",
    config,
  } satisfies ZapClientPlugin<"auth">;
}
