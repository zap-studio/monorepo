import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";

export function blogPlugin(
  config?: Partial<BlogServerPluginConfig>
): ZapServerPlugin<"blog", BlogServerPluginConfig> {
  return {
    id: "blog",
    config,
  } satisfies ZapServerPlugin<"blog", BlogServerPluginConfig>;
}
