import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import matter from "gray-matter";
import { ApplicationError, FileOperationError } from "@/zap/errors";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { BlogServerPluginConfig } from "@/zap/plugins/types/blog.plugin";
import { BASE_URL, ZAP_DEFAULT_METADATA } from "@/zap.config";
import { PostMetadataSchema } from "../schemas";

export function parseFrontmatter(fileContent: string) {
  try {
    const { data: metadata, content } = matter(fileContent);
    return {
      metadata: PostMetadataSchema.parse(metadata),
      content,
    };
  } catch (error) {
    throw new ApplicationError("Failed to parse frontmatter", error);
  }
}

export async function getMDXFiles(dir: string) {
  try {
    const files = await fs.readdir(dir);
    return files.filter((file) => path.extname(file) === ".mdx");
  } catch (error) {
    throw new FileOperationError("Failed to read directory", error);
  }
}

export async function readMDXFile(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return parseFrontmatter(fileContent);
  } catch (error) {
    throw new FileOperationError("Failed to read file", error);
  }
}

export async function getMDXData(dir: string) {
  try {
    const mdxFiles = await getMDXFiles(dir);
    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        try {
          const { metadata, content } = await readMDXFile(path.join(dir, file));
          return {
            metadata,
            slug: path.basename(file, path.extname(file)),
            content,
          };
        } catch (error) {
          throw new FileOperationError(
            `Failed to read MDX file ${file}`,
            error
          );
        }
      })
    );
    return posts;
  } catch (error) {
    throw new ApplicationError("Failed to get MDX data", error);
  }
}

export async function getBlogPosts(pluginConfigs?: {
  blog: Partial<BlogServerPluginConfig>;
}) {
  const BLOG_DIR = pluginConfigs?.blog.DATA_DIR ?? DEFAULT_CONFIG.blog.DATA_DIR;
  return await getMDXData(BLOG_DIR);
}

export async function getBlogPostsMetadata(pluginConfigs: {
  blog: Partial<BlogServerPluginConfig>;
}) {
  const posts = await getBlogPosts(pluginConfigs);
  return posts.map((post) => ({
    ...post.metadata,
    slug: post.slug,
  }));
}

export async function getBlogPost(
  slug: string,
  pluginConfigs: { blog: Partial<BlogServerPluginConfig> }
) {
  try {
    const BLOG_DIR =
      pluginConfigs.blog.DATA_DIR ?? DEFAULT_CONFIG.blog.DATA_DIR;
    const { metadata, content } = await readMDXFile(
      path.join(BLOG_DIR, `${slug}.mdx`)
    );
    return {
      metadata,
      slug,
      content,
    };
  } catch (error) {
    throw new ApplicationError(`Failed to read blog post ${slug}`, error);
  }
}

export function formatDate(date: string, includeRelative = false) {
  const targetDate = parseISO(date);
  const fullDate = format(targetDate, "MMMM d, yyyy");

  if (includeRelative) {
    const relativeDate = formatDistanceToNow(targetDate, { addSuffix: true });
    return `${fullDate} (${relativeDate})`;
  }

  return fullDate;
}

export async function generateBlogPostMetadata(
  slug: string,
  pluginConfigs: { blog: Partial<BlogServerPluginConfig> }
) {
  const post = await getBlogPost(slug, pluginConfigs).catch(() => null);

  if (!post) {
    return ZAP_DEFAULT_METADATA;
  }

  const openGraphImage =
    post.metadata.image ||
    `${BASE_URL}/opengraph-image?title=${post.metadata.title}`;

  return {
    title: `${post.metadata.title} | ${ZAP_DEFAULT_METADATA.title}`,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url: `${BASE_URL}/blog/${slug}`,
      images: [{ url: openGraphImage }],
    },
    twitter: {
      title: post.metadata.title,
      description: post.metadata.description,
      card: "summary_large_image",
      images: [openGraphImage],
    },
  };
}
