import type { ZapClientPlugin } from "@/zap/plugins/types";
import type { BlogClientPluginConfig } from "@/zap/plugins/types/blog.plugin";

export function blogClientPlugin(
  config?: Partial<BlogClientPluginConfig>
): ZapClientPlugin<"blog", BlogClientPluginConfig> {
  return {
    id: "blog",
    config,
  } satisfies ZapClientPlugin<"blog">;
}
