import type { ComponentType } from "react";
import type { ZapServerPlugin } from "@/zap/plugins/types";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { checkBlogPathAccess } from "./authorization";
import { LatestBlogPosts } from "./components/latest-blog-posts";

export function blogPlugin(
  config?: Partial<BlogServerPluginConfig>
): ZapServerPlugin<
  "blog",
  BlogServerPluginConfig,
  Record<string, unknown>,
  Record<string, ComponentType<unknown>>,
  { checkBlogPathAccess: typeof checkBlogPathAccess },
  {
    LatestBlogPosts: typeof LatestBlogPosts;
  }
> {
  return {
    id: "blog",
    config,
    middleware: {
      checkBlogPathAccess,
    },
    components: {
      LatestBlogPosts,
    },
  } satisfies ZapServerPlugin<"blog">;
}
