import type { ZapClientPlugin } from "@/zap/plugins/types";
import type { BlogClientPluginConfig } from "@/zap/plugins/types/blog.plugin";

export function blogClientPlugin(): ZapClientPlugin<
  "blog",
  BlogClientPluginConfig
> {
  return {
    id: "blog",
  } satisfies ZapClientPlugin<"blog">;
}
