import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BlogPosting, WithContext } from "schema-dts";
import serialize from "serialize-javascript";
import { CustomMDX } from "@/zap/markdown/mdx";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { BASE_URL } from "@/zap.config";
import {
  formatDate,
  generateBlogPostMetadata,
  getBlogPost,
  getBlogPostsMetadata,
} from "../utils";

type GenerateMetadataParams = {
  params: Promise<{ slug: string }>;
  pluginConfigs: { blog: Partial<BlogServerPluginConfig> };
};

export async function _generateMetadata({
  params,
  pluginConfigs,
}: GenerateMetadataParams): Promise<Metadata> {
  const { slug } = await params;
  return await generateBlogPostMetadata(slug, pluginConfigs);
}

export async function _generateStaticParams(pluginConfigs: {
  blog: Partial<BlogServerPluginConfig>;
}) {
  if (!pluginConfigs?.blog) {
    return [];
  }
  const posts = await getBlogPostsMetadata(pluginConfigs);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export type _BlogSlugPageProps = {
  params: Promise<{ slug: string }>;
  pluginConfigs?: { blog: Partial<BlogServerPluginConfig> };
};

export async function _BlogSlugPage({
  params,
  pluginConfigs,
}: _BlogSlugPageProps) {
  const { slug } = await params;
  if (!pluginConfigs?.blog) {
    notFound();
  }
  const post = await getBlogPost(slug, pluginConfigs);

  if (!post) {
    notFound();
  }

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: new Date(post.metadata.date).toISOString(),
    dateModified: new Date(post.metadata.date).toISOString(),
    description: post.metadata.description,
    image:
      post.metadata.image ||
      `${BASE_URL}/opengraph-image?title=${post.metadata.title}`,
    url: `${BASE_URL}/blog/${post.slug}`,
    ...(post.metadata.author && {
      author: {
        "@type": "Person",
        name: post.metadata.author,
      },
    }),
  };

  const jsonLdString = serialize(jsonLd);

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <script suppressHydrationWarning type="application/ld+json">
        {jsonLdString}
      </script>
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <div className="mb-8">
          {post.metadata.date && (
            <p className="mb-2 text-muted-foreground text-sm">
              {formatDate(post.metadata.date, true)}
            </p>
          )}

          <h1 className="mb-4 font-bold text-4xl">{post.metadata.title}</h1>
        </div>

        <div className="prose-content">
          <CustomMDX source={post.content} />
        </div>
      </article>
    </div>
  );
}
