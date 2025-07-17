import type { Metadata } from "next";

import { ZAP_DEFAULT_METADATA } from "@/zap.config";
import { formatDate, getBlogPosts } from "@/zap/lib/blog/utils";

export const metadata: Metadata = {
  title: `${ZAP_DEFAULT_METADATA.title} | Blog`,
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col py-24">
      <h1 className="text-2xl font-semibold">Blog</h1>
      <p className="mt-2 text-gray-700">
        Welcome to the blog page. Here you will find various articles and posts.
      </p>

      <ul className="mt-8 space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b pb-6">
            <h2 className="text-xl font-bold">{post.metadata.title}</h2>

            <p className="mt-1 text-sm text-gray-600">
              {post.metadata.date
                ? formatDate(post.metadata.date, true)
                : "No date provided"}
            </p>

            {post.metadata.description && (
              <p className="mt-2 text-gray-800">{post.metadata.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
