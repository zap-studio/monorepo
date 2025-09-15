import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import { formatDate, getBlogPostsMetadata } from "../utils";

export const _metadata: Metadata = {
  title: `${ZAP_DEFAULT_METADATA.title} | Blog`,
};

type BlogPageProps = {
  pluginConfigs: { blog: Partial<BlogServerPluginConfig> };
};

export async function _BlogPage({ pluginConfigs }: BlogPageProps) {
  if (!pluginConfigs?.blog) {
    return null;
  }

  const posts = await getBlogPostsMetadata(pluginConfigs);

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="flex flex-col">
        {posts.map((post, index) => (
          <div
            className={`py-6 ${index < posts.length - 1 ? "border-b" : ""}`}
            key={post.slug}
          >
            <Link
              href={{
                pathname: `${pluginConfigs.blog.BASE_PATH ?? DEFAULT_CONFIG.blog.BASE_PATH}/${post.slug}`,
              }}
            >
              <div className="rounded-md p-4 px-0 hover:bg-muted md:px-4 md:active:bg-muted">
                {post.date && (
                  <p className="mb-2 text-muted-foreground text-xs">
                    {formatDate(post.date, true)}
                  </p>
                )}

                <h2 className="mb-2 font-semibold text-3xl">{post.title}</h2>

                {post.description && (
                  <p className="text-base text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
