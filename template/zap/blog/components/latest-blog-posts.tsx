import Link from "next/link";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { formatDate, getBlogPostsMetadata } from "../utils";

const DEFAULT_MAX_POSTS = 3;

type LatestBlogPostsProps = {
  pluginConfigs: { blog: Partial<BlogServerPluginConfig> };
};

export async function LatestBlogPosts({ pluginConfigs }: LatestBlogPostsProps) {
  const posts = await getBlogPostsMetadata(pluginConfigs);

  if (posts.length === 0) {
    return null;
  }

  const latestPosts = posts.slice(
    0,
    pluginConfigs.blog.MAX_BLOG_POSTS_IN_FOOTER ?? DEFAULT_MAX_POSTS
  );

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold">Latest Articles</h3>

      <div className="flex flex-col space-y-3">
        {latestPosts.map((post) => (
          <Link
            className="group flex flex-col space-y-1"
            href={{
              pathname: `${pluginConfigs.blog.BASE_PATH ?? DEFAULT_CONFIG.blog.BASE_PATH}/${post.slug}`,
            }}
            key={post.slug}
          >
            <h4 className="font-medium text-foreground text-sm transition-colors group-hover:text-primary group-active:text-primary">
              {post.title}
            </h4>

            {post.date && (
              <p className="text-muted-foreground text-xs">
                {formatDate(post.date, true)}
              </p>
            )}
          </Link>
        ))}
      </div>

      <Link
        className="w-fit text-muted-foreground text-sm underline-offset-4 hover:underline active:underline"
        href={{ pathname: pluginConfigs.blog.BASE_PATH ?? "/blog" }}
      >
        View all articles →
      </Link>
    </div>
  );
}
