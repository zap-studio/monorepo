import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BASE_URL, ZAP_DEFAULT_METADATA } from "@/zap.config";
import { CustomMDX } from "@/zap/components/blog/mdx";
import {
  formatDate,
  getBlogPost,
  getBlogPostsMetadata,
} from "@/zap/lib/blog/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return;
  }

  return {
    title: `${post.metadata.title} | ${ZAP_DEFAULT_METADATA.title}`,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url: `${BASE_URL}/blog/${slug}`,
      images: post.metadata.image ? [{ url: post.metadata.image }] : undefined, // FIXME: rework to match the new image format in case of no image for the blog post
    },
    twitter: {
      title: post.metadata.title,
      description: post.metadata.description,
      card: "summary_large_image",
      images: post.metadata.image ? [post.metadata.image] : undefined, // FIXME: rework to match the new image format in case of no image for the blog post
    },
  };
}

export async function generateStaticParams() {
  const posts = await getBlogPostsMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <div className="mb-8">
          {post.metadata.date && (
            <p className="text-muted-foreground mb-2 text-sm">
              {formatDate(post.metadata.date, true)}
            </p>
          )}

          <h1 className="mb-4 text-4xl font-bold">{post.metadata.title}</h1>

          {post.metadata.description && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {post.metadata.description}
            </p>
          )}
        </div>

        <div className="prose-content">
          <CustomMDX source={post.content} />
        </div>
      </article>
    </div>
  );
}
