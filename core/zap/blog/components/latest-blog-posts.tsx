import Link from "next/link";

import { formatDate, getBlogPostsMetadata } from "../utils";

export async function LatestBlogPosts() {
  const posts = await getBlogPostsMetadata();

  if (posts.length === 0) {
    return null;
  }

  const latestPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col space-y-4">
      <h3 className="font-semibold">Latest Articles</h3>

      <div className="flex flex-col space-y-3">
        {latestPosts.map((post) => (
          <Link
            className="group flex flex-col space-y-1"
            href={`/blog/${post.slug}`}
            key={post.slug}
          >
            <h4 className="text-foreground group-hover:text-primary group-active:text-primary text-sm font-medium transition-colors">
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
        className="text-muted-foreground w-fit text-sm underline-offset-4 hover:underline active:underline"
        href="/blog"
      >
        View all articles →
      </Link>
    </div>
  );
}
