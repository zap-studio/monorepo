import type { Metadata } from "next";
import Link from "next/link";

import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import { formatDate, getBlogPostsMetadata } from "../utils";

export const _metadata: Metadata = {
  title: `${ZAP_DEFAULT_METADATA.title} | Blog`,
};

export async function _BlogPage() {
  const posts = await getBlogPostsMetadata();

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="flex flex-col">
        {posts.map((post, index) => (
          <div
            className={`py-6 ${index < posts.length - 1 ? "border-b" : ""}`}
            key={post.slug}
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="hover:bg-muted md:active:bg-muted rounded-md p-4 px-0 md:px-4">
                {post.date && (
                  <p className="text-muted-foreground mb-2 text-xs">
                    {formatDate(post.date, true)}
                  </p>
                )}

                <h2 className="mb-2 text-3xl font-semibold">{post.title}</h2>

                {post.description && (
                  <p className="text-muted-foreground text-base">
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
