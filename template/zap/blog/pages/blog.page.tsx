import type { Metadata } from "next";
import Link from "next/link";
import { getServerPlugin } from "@/lib/zap.server";
import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import { formatDate, getBlogPostsMetadata } from "../utils";

export const _metadata: Metadata = {
  title: `${ZAP_DEFAULT_METADATA.title} | Blog`,
};

export async function _BlogPage() {
  const blog = getServerPlugin("blog");
  const posts = await getBlogPostsMetadata(blog?.config);

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
                pathname: `${blog?.config?.BASE_PATH ?? "/blog"}/${post.slug}`,
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
