import Link from "next/link";

import { formatDate, getBlogPostsMetadata } from "../utils";
import { ZAP_BLOG_CONFIG } from "../zap.plugin.config";

export async function LatestBlogPosts() {
  const posts = await getBlogPostsMetadata();

  if (posts.length === 0) {
    return null;
  }

  const latestPosts = posts.slice(0, ZAP_BLOG_CONFIG.MAX_BLOG_POSTS_IN_FOOTER);

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold">Latest Articles</h3>

      <div className="flex flex-col space-y-3">
        {latestPosts.map((post) => (
          <Link
            className="group flex flex-col space-y-1"
            href={{ pathname: `${ZAP_BLOG_CONFIG.BASE_PATH}/${post.slug}` }}
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
        href={{ pathname: ZAP_BLOG_CONFIG.BASE_PATH }}
      >
        View all articles →
      </Link>
    </div>
  );
}
